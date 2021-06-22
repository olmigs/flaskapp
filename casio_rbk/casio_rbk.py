import binascii
import struct


class Atom:
  Patch = 0x10
  Volume = 0x11
  Pan = 0x12
  
class Part:
  # Value common to all CT-X keyboards (& CDP-S):
  U1 = 0
  U2 = 1
  Auto_Harmony = 4
  
  # Values specific to CT-X700/800:
  L = 2
  
  # Values specific to CT-X3000/5000:
  L1 = 2
  L2 = 3



# Registration format as it depends on the target keyboard
REGISTRATION_FORMATS = {
  'CT-X3000': {'bank_size': 8, 'file_version': 1},
  'CT-X5000': {'bank_size': 8, 'file_version': 1},
  'CT-X700':  {'bank_size': 4, 'file_version': 0},
  'CT-X800':  {'bank_size': 4, 'file_version': 0},  # ... presumed, not checked
  'CDP-S350': {'bank_size': 4, 'file_version': 1}
}
  

class Registration:
  
  class RegistrationData(bytes):
    def __init__(self, data):
      self.data = data
      self.registration_obj = None

    def AssociateParent(self, n, registration_obj):
      self.n = n
      self.registration_obj = registration_obj

    def __setitem__(self, index, value):
      self.data[index] = value
      # Changing any data must change the underlying Registration object
      if self.registration_obj:
        self.registration_obj[self.n] = self.data

    def __getitem__(self, index):
      return self.data[index]

    def __len__(self):
      return len(self.data)

    def __delitem__(self, index):
      raise Exception("Can't delete from a registration data item")

    def insert(self, index, value):
      raise Exception("Can't insert into a registration data item")
    
    def __repr__(self):
      return repr(bytes(self.data))


  data = bytearray()
  
  def __init__(self, data=None):
    if data:
      self.data = bytearray(data)

  def __bytes__(self):
    return bytes(self.data)
    
  def __iter__(self):
    self.i = 0
    return self
    
  def __next__(self):
    # "Walk" through the atoms in the registration
    if self.i < len(self.data):
      (atom_type, atom_len) = struct.unpack_from('<2B', self.data, self.i)
      b = self.data[self.i+2:self.i+2+atom_len]
      self.i += 2+atom_len
      return (atom_type, b)
    else:
      raise StopIteration

  def __getitem__(self, n):
    # "Walk" the data to find the item
    
    for (atom, b) in self:
      if atom == n:
        # Found it!
        obj = Registration.RegistrationData(b)
        obj.AssociateParent(n, self)
        return obj
    # If get here, haven't found it
    return None
    

  def __setitem__(self, n, x):
    # "Walk" the data to find the item. Can't use the iterator in this case
    # because that returns a read-only value
    
    i = 0
    while i < len(self.data):
      (atom_type, atom_len) = struct.unpack_from('<2B', self.data, i)
      if atom_type == n:
        # Found it!
        
        if len(x) > atom_len:
          raise Exception("Trying to write {0} bytes when only space for {1}".format(len(x), atom_len))
        
        self.data[i+2:i+2+len(x)] = x
        return
      elif atom_type == 0xFF:
        # End
        break
      i += 2+atom_len
    # If get here, haven't found it. Could raise an error

  def __len__(self):
    # "Walk" the data to count total items
    
    i = 0
    count = 0
    while i < len(self.data):
      count += 1
      (atom_type, atom_len) = struct.unpack_from('<2B', self.data, i)
      if atom_type == 0xFF:
        # End
        break
      i += 2+atom_len
    return count



  # Now some convenience functions, specifically for CT-X700/800:
  def setVolumes(self, u1_vol, u2_vol, l1_vol):
    self.__setitem__(Atom.Volume, struct.pack('<3B', u1_vol, u2_vol, l1_vol))
    
  def getVolumes(self):
    return(struct.unpack('<3B', self.__getitem__(Atom.Volume)[0:3]))

  def setPans(self, u1_pan, u2_pan, l1_pan):
    self.__setitem__(Atom.Pan, struct.pack('<3B', u1_pan, u2_pan, l1_pan))
    
  def getPans(self):
    return(struct.unpack('<3B', self.__getitem__(Atom.Pan)[0:3]))

  def getPatchBank(self, part):
    # Returns (patch, bankMSB) as a tuple. Can be passed to patch_name function
    # using a prefix "*". For example:
    #
    #   MyPatchName = patch_name.patch_name(*MyReg.getPatchBank(Part.U1))
    
    return(struct.unpack_from('<2B', self.__getitem__(Atom.Patch), 2*part))



class RegistrationBank:
  
  def __init__(self, keyboard="CT-X700"):
    self.keyboard=keyboard
    self.registrations=[]

  @classmethod
  def readFile(cls, f):
    bin_str = f.read()
    
    # First 16 bytes contain the keyboard type
    keyboard = bin_str[0:16].decode('ascii').strip('\x00')
    i = 16

    if bin_str[i:i+4] != b'RBKH':
      raise Exception("Incorrect format. Expected RBKH")
    
    i += 8
    
    
    regs = []
    while i < len(bin_str):
    
      if bin_str[i:i+4] != b'REGH':
        raise Exception("Incorrect format. Expected REGH")
      i += 8
      crc , length = struct.unpack_from('<2I', bin_str, i)
      i += 8
      reg = bin_str[i:i+length]
      
      if binascii.crc32(reg) != crc:
        raise Exception(f"CRC mismatch at offset {i-4}")
        
      regs.append(Registration(reg))
      i += length
      
      if bin_str[i:i+4] != b'EODA':
        raise Exception("Incorrect format. Expected EODA")
        
      i += 4

    
    obj = cls(keyboard)
    obj.registrations = regs
    return obj

  def writeFile(self, f):
    
    fmt = REGISTRATION_FORMATS[self.keyboard]
    
    regs = self.registrations
    
    if len(regs) > fmt['bank_size']:
      raise Exception(f"Need at most {fmt['bank_size']} registrations to make an .RBK file. Got {len(regs)}")
    else:
      # Too few registrations. Pad it by copying the first one
      while len(regs) < fmt['bank_size']:
        regs.append(regs[0])
      
    b = self.keyboard.encode('ascii').ljust(16, b'\x00')
    b += b'RBKH'
    b += struct.pack('<I', fmt['file_version'])
    
    for reg_bytes in [bytes(reg) for reg in regs]:
      
      b += b'REGH'
      b += struct.pack('<3I', fmt['file_version'], binascii.crc32(reg_bytes), len(reg_bytes))
      b += reg_bytes
      b += b'EODA'
    
    f.seek(0, 0) # Make sure we are writing to the beginning of the file
    f.write(b)   # Write it
    return self

  def __getitem__(self, n):
    return self.registrations[n]

  def __setitem__(self, n, r):
    self.registrations[n] = r

  def __iter__(self):
    return iter(self.registrations)
    
  def __len__(self):
    return len(self.registrations)

