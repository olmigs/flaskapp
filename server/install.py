import os, PyInstaller.__main__
THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))
INSTALL_FILE = os.path.join(THIS_FOLDER, 'server.py')

PyInstaller.__main__.run([
    INSTALL_FILE,
    '--onefile'
])