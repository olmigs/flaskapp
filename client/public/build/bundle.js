
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const storedFilename = localStorage.getItem('filename');
    const filename = writable(storedFilename);
    filename.subscribe( value => {
        localStorage.setItem('filename', value === null ? '' : value);
    });

    const slots = writable([]);
    async function updateSlots(server) {
        const endpoint = server + "/slots";
        await setStore(endpoint, slots);
    }

    const names = writable([]);
    async function updateNames(server) {
        const endpoint = server + "/names";
        await setStore(endpoint, names);
    }

    // assumes store has a known/strict type
    async function setStore(endpoint, store) {
        const http = window.__TAURI__.http;
        http
            .fetch(endpoint)
            .then(
                response => {
                    store.set(response.data);
                })
            .catch(function(err) {
                console.log('Fetch Error :-S', err);
            });
    }

    var slotcolors_A=["#800040","#47b8b3","#804000","#3ec180"];var slotcolors_B=["#ed4846","#cc6627","#3ec180","#47b8b3"];var cfg = {slotcolors_A:slotcolors_A,slotcolors_B:slotcolors_B};

    /* src/RegSlot.svelte generated by Svelte v3.38.2 */
    const file$2 = "src/RegSlot.svelte";

    function create_fragment$2(ctx) {
    	let table;
    	let tr0;
    	let td0;
    	let t0;
    	let t1;
    	let t2;
    	let td1;
    	let t3;
    	let t4;
    	let t5;
    	let td2;
    	let t6;
    	let t7;
    	let t8;
    	let tr1;
    	let td3;
    	let t9_value = /*names*/ ctx[10]["u1"] + "";
    	let t9;
    	let t10;
    	let td4;
    	let t11_value = /*names*/ ctx[10]["u2"] + "";
    	let t11;
    	let t12;
    	let td5;
    	let t13_value = /*names*/ ctx[10]["l"] + "";
    	let t13;
    	let t14;
    	let tr2;
    	let td6;
    	let div0;
    	let label0;
    	let t16;
    	let input0;
    	let input0_name_value;
    	let t17;
    	let input1;
    	let t18;
    	let td7;
    	let div1;
    	let label1;
    	let t20;
    	let input2;
    	let input2_name_value;
    	let t21;
    	let input3;
    	let t22;
    	let td8;
    	let div2;
    	let label2;
    	let t24;
    	let input4;
    	let input4_name_value;
    	let t25;
    	let input5;
    	let t26;
    	let tr3;
    	let td9;
    	let div3;
    	let label3;
    	let t28;
    	let input6;
    	let input6_name_value;
    	let t29;
    	let p0;
    	let t30;
    	let input7;
    	let t31;
    	let t32;
    	let td10;
    	let div4;
    	let label4;
    	let t34;
    	let input8;
    	let input8_name_value;
    	let t35;
    	let p1;
    	let t36;
    	let input9;
    	let t37;
    	let t38;
    	let td11;
    	let div5;
    	let label5;
    	let t40;
    	let input10;
    	let input10_name_value;
    	let t41;
    	let p2;
    	let t42;
    	let input11;
    	let t43;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			table = element("table");
    			tr0 = element("tr");
    			td0 = element("td");
    			t0 = text(/*u1_name*/ ctx[7]);
    			t1 = text(" (Main)");
    			t2 = space();
    			td1 = element("td");
    			t3 = text(/*u2_name*/ ctx[8]);
    			t4 = text(" (Layer)");
    			t5 = space();
    			td2 = element("td");
    			t6 = text(/*l_name*/ ctx[9]);
    			t7 = text(" (Split)");
    			t8 = space();
    			tr1 = element("tr");
    			td3 = element("td");
    			t9 = text(t9_value);
    			t10 = space();
    			td4 = element("td");
    			t11 = text(t11_value);
    			t12 = space();
    			td5 = element("td");
    			t13 = text(t13_value);
    			t14 = space();
    			tr2 = element("tr");
    			td6 = element("td");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Volume";
    			t16 = space();
    			input0 = element("input");
    			t17 = space();
    			input1 = element("input");
    			t18 = space();
    			td7 = element("td");
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Volume";
    			t20 = space();
    			input2 = element("input");
    			t21 = space();
    			input3 = element("input");
    			t22 = space();
    			td8 = element("td");
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Volume";
    			t24 = space();
    			input4 = element("input");
    			t25 = space();
    			input5 = element("input");
    			t26 = space();
    			tr3 = element("tr");
    			td9 = element("td");
    			div3 = element("div");
    			label3 = element("label");
    			label3.textContent = "Pan";
    			t28 = space();
    			input6 = element("input");
    			t29 = space();
    			p0 = element("p");
    			t30 = text("L ");
    			input7 = element("input");
    			t31 = text(" R");
    			t32 = space();
    			td10 = element("td");
    			div4 = element("div");
    			label4 = element("label");
    			label4.textContent = "Pan";
    			t34 = space();
    			input8 = element("input");
    			t35 = space();
    			p1 = element("p");
    			t36 = text("L ");
    			input9 = element("input");
    			t37 = text(" R");
    			t38 = space();
    			td11 = element("td");
    			div5 = element("div");
    			label5 = element("label");
    			label5.textContent = "Pan";
    			t40 = space();
    			input10 = element("input");
    			t41 = space();
    			p2 = element("p");
    			t42 = text("L ");
    			input11 = element("input");
    			t43 = text(" R");
    			attr_dev(td0, "class", "svelte-1imrzmc");
    			add_location(td0, file$2, 23, 8, 857);
    			attr_dev(td1, "class", "svelte-1imrzmc");
    			add_location(td1, file$2, 24, 8, 891);
    			attr_dev(td2, "class", "svelte-1imrzmc");
    			add_location(td2, file$2, 25, 8, 926);
    			set_style(tr0, "font-weight", "bold");
    			set_style(tr0, "background-color", lum(cfg.slotcolors_B[/*index*/ ctx[6]], -0.3));
    			attr_dev(tr0, "class", "svelte-1imrzmc");
    			add_location(tr0, file$2, 22, 4, 764);
    			attr_dev(td3, "class", "svelte-1imrzmc");
    			add_location(td3, file$2, 28, 8, 1076);
    			attr_dev(td4, "class", "svelte-1imrzmc");
    			add_location(td4, file$2, 29, 8, 1107);
    			attr_dev(td5, "class", "svelte-1imrzmc");
    			add_location(td5, file$2, 30, 8, 1138);
    			set_style(tr1, "font-size", "10pt");
    			set_style(tr1, "font-style", "italic");
    			set_style(tr1, "background-color", lum(cfg.slotcolors_B[/*index*/ ctx[6]], 0.1));
    			attr_dev(tr1, "class", "svelte-1imrzmc");
    			add_location(tr1, file$2, 27, 4, 966);
    			attr_dev(label0, "for", "u1_vol");
    			attr_dev(label0, "class", "svelte-1imrzmc");
    			add_location(label0, file$2, 35, 16, 1304);
    			attr_dev(input0, "class", "input_sm svelte-1imrzmc");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "u1_vol");
    			attr_dev(input0, "name", input0_name_value = "" + (/*index*/ ctx[6] + "_u1_vol"));
    			add_location(input0, file$2, 36, 16, 1355);
    			attr_dev(div0, "class", "flexed svelte-1imrzmc");
    			add_location(div0, file$2, 34, 12, 1267);
    			attr_dev(input1, "type", "range");
    			attr_dev(input1, "class", "slider svelte-1imrzmc");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "max", "127");
    			attr_dev(input1, "step", "1");
    			add_location(input1, file$2, 38, 12, 1478);
    			attr_dev(td6, "class", "svelte-1imrzmc");
    			add_location(td6, file$2, 33, 8, 1250);
    			attr_dev(label1, "for", "u2_vol");
    			attr_dev(label1, "class", "svelte-1imrzmc");
    			add_location(label1, file$2, 42, 16, 1640);
    			attr_dev(input2, "class", "input_sm svelte-1imrzmc");
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "id", "u2_vol");
    			attr_dev(input2, "name", input2_name_value = "" + (/*index*/ ctx[6] + "_u2_vol"));
    			add_location(input2, file$2, 43, 16, 1691);
    			attr_dev(div1, "class", "flexed svelte-1imrzmc");
    			add_location(div1, file$2, 41, 12, 1603);
    			attr_dev(input3, "type", "range");
    			attr_dev(input3, "class", "slider svelte-1imrzmc");
    			attr_dev(input3, "min", "0");
    			attr_dev(input3, "max", "127");
    			attr_dev(input3, "step", "1");
    			add_location(input3, file$2, 45, 12, 1814);
    			attr_dev(td7, "class", "svelte-1imrzmc");
    			add_location(td7, file$2, 40, 8, 1586);
    			attr_dev(label2, "for", "l_vol");
    			attr_dev(label2, "class", "svelte-1imrzmc");
    			add_location(label2, file$2, 49, 16, 1974);
    			attr_dev(input4, "class", "input_sm svelte-1imrzmc");
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "id", "l_vol");
    			attr_dev(input4, "name", input4_name_value = "" + (/*index*/ ctx[6] + "_l_vol"));
    			add_location(input4, file$2, 50, 16, 2024);
    			attr_dev(div2, "class", "flexed svelte-1imrzmc");
    			add_location(div2, file$2, 48, 12, 1937);
    			attr_dev(input5, "type", "range");
    			attr_dev(input5, "class", "slider svelte-1imrzmc");
    			attr_dev(input5, "min", "0");
    			attr_dev(input5, "max", "127");
    			attr_dev(input5, "step", "1");
    			add_location(input5, file$2, 52, 12, 2144);
    			attr_dev(td8, "class", "svelte-1imrzmc");
    			add_location(td8, file$2, 47, 8, 1920);
    			set_style(tr2, "background-color", lum(cfg.slotcolors_B[/*index*/ ctx[6]], 0.75));
    			attr_dev(tr2, "class", "svelte-1imrzmc");
    			add_location(tr2, file$2, 32, 4, 1174);
    			attr_dev(label3, "for", "u1_pan");
    			attr_dev(label3, "class", "svelte-1imrzmc");
    			add_location(label3, file$2, 58, 16, 2385);
    			attr_dev(input6, "class", "input_sm svelte-1imrzmc");
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "id", "u1_pan");
    			attr_dev(input6, "name", input6_name_value = "" + (/*index*/ ctx[6] + "_u1_pan"));
    			add_location(input6, file$2, 59, 16, 2433);
    			attr_dev(div3, "class", "flexed svelte-1imrzmc");
    			add_location(div3, file$2, 57, 12, 2348);
    			attr_dev(input7, "type", "range");
    			attr_dev(input7, "class", "slider svelte-1imrzmc");
    			attr_dev(input7, "min", "0");
    			attr_dev(input7, "max", "127");
    			attr_dev(input7, "step", "1");
    			add_location(input7, file$2, 62, 18, 2577);
    			add_location(p0, file$2, 61, 12, 2555);
    			attr_dev(td9, "class", "svelte-1imrzmc");
    			add_location(td9, file$2, 56, 8, 2331);
    			attr_dev(label4, "for", "u2_pan");
    			attr_dev(label4, "class", "svelte-1imrzmc");
    			add_location(label4, file$2, 68, 16, 2769);
    			attr_dev(input8, "class", "input_sm svelte-1imrzmc");
    			attr_dev(input8, "type", "text");
    			attr_dev(input8, "id", "u2_pan");
    			attr_dev(input8, "name", input8_name_value = "" + (/*index*/ ctx[6] + "_u2_pan"));
    			add_location(input8, file$2, 69, 16, 2817);
    			attr_dev(div4, "class", "flexed svelte-1imrzmc");
    			add_location(div4, file$2, 67, 12, 2732);
    			attr_dev(input9, "type", "range");
    			attr_dev(input9, "class", "slider svelte-1imrzmc");
    			attr_dev(input9, "min", "0");
    			attr_dev(input9, "max", "127");
    			attr_dev(input9, "step", "1");
    			add_location(input9, file$2, 72, 18, 2962);
    			add_location(p1, file$2, 71, 12, 2940);
    			attr_dev(td10, "class", "svelte-1imrzmc");
    			add_location(td10, file$2, 66, 8, 2715);
    			attr_dev(label5, "for", "l_pan");
    			attr_dev(label5, "class", "svelte-1imrzmc");
    			add_location(label5, file$2, 77, 16, 3141);
    			attr_dev(input10, "class", "input_sm svelte-1imrzmc");
    			attr_dev(input10, "type", "text");
    			attr_dev(input10, "id", "l_pan");
    			attr_dev(input10, "name", input10_name_value = "" + (/*index*/ ctx[6] + "_l_pan"));
    			add_location(input10, file$2, 78, 16, 3188);
    			attr_dev(div5, "class", "flexed svelte-1imrzmc");
    			add_location(div5, file$2, 76, 12, 3104);
    			attr_dev(input11, "type", "range");
    			attr_dev(input11, "class", "slider svelte-1imrzmc");
    			attr_dev(input11, "min", "0");
    			attr_dev(input11, "max", "127");
    			attr_dev(input11, "step", "1");
    			add_location(input11, file$2, 81, 18, 3330);
    			add_location(p2, file$2, 80, 12, 3308);
    			attr_dev(td11, "class", "svelte-1imrzmc");
    			add_location(td11, file$2, 75, 8, 3087);
    			set_style(tr3, "background-color", lum(cfg.slotcolors_B[/*index*/ ctx[6]], 0.99));
    			attr_dev(tr3, "class", "svelte-1imrzmc");
    			add_location(tr3, file$2, 55, 4, 2255);
    			attr_dev(table, "class", "regslot svelte-1imrzmc");
    			add_location(table, file$2, 21, 0, 735);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, tr0);
    			append_dev(tr0, td0);
    			append_dev(td0, t0);
    			append_dev(td0, t1);
    			append_dev(tr0, t2);
    			append_dev(tr0, td1);
    			append_dev(td1, t3);
    			append_dev(td1, t4);
    			append_dev(tr0, t5);
    			append_dev(tr0, td2);
    			append_dev(td2, t6);
    			append_dev(td2, t7);
    			append_dev(table, t8);
    			append_dev(table, tr1);
    			append_dev(tr1, td3);
    			append_dev(td3, t9);
    			append_dev(tr1, t10);
    			append_dev(tr1, td4);
    			append_dev(td4, t11);
    			append_dev(tr1, t12);
    			append_dev(tr1, td5);
    			append_dev(td5, t13);
    			append_dev(table, t14);
    			append_dev(table, tr2);
    			append_dev(tr2, td6);
    			append_dev(td6, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t16);
    			append_dev(div0, input0);
    			set_input_value(input0, /*u1_vol*/ ctx[0]);
    			append_dev(td6, t17);
    			append_dev(td6, input1);
    			set_input_value(input1, /*u1_vol*/ ctx[0]);
    			append_dev(tr2, t18);
    			append_dev(tr2, td7);
    			append_dev(td7, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t20);
    			append_dev(div1, input2);
    			set_input_value(input2, /*u2_vol*/ ctx[2]);
    			append_dev(td7, t21);
    			append_dev(td7, input3);
    			set_input_value(input3, /*u2_vol*/ ctx[2]);
    			append_dev(tr2, t22);
    			append_dev(tr2, td8);
    			append_dev(td8, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t24);
    			append_dev(div2, input4);
    			set_input_value(input4, /*l_vol*/ ctx[4]);
    			append_dev(td8, t25);
    			append_dev(td8, input5);
    			set_input_value(input5, /*l_vol*/ ctx[4]);
    			append_dev(table, t26);
    			append_dev(table, tr3);
    			append_dev(tr3, td9);
    			append_dev(td9, div3);
    			append_dev(div3, label3);
    			append_dev(div3, t28);
    			append_dev(div3, input6);
    			set_input_value(input6, /*u1_pan*/ ctx[1]);
    			append_dev(td9, t29);
    			append_dev(td9, p0);
    			append_dev(p0, t30);
    			append_dev(p0, input7);
    			set_input_value(input7, /*u1_pan*/ ctx[1]);
    			append_dev(p0, t31);
    			append_dev(tr3, t32);
    			append_dev(tr3, td10);
    			append_dev(td10, div4);
    			append_dev(div4, label4);
    			append_dev(div4, t34);
    			append_dev(div4, input8);
    			set_input_value(input8, /*u2_pan*/ ctx[3]);
    			append_dev(td10, t35);
    			append_dev(td10, p1);
    			append_dev(p1, t36);
    			append_dev(p1, input9);
    			set_input_value(input9, /*u2_pan*/ ctx[3]);
    			append_dev(p1, t37);
    			append_dev(tr3, t38);
    			append_dev(tr3, td11);
    			append_dev(td11, div5);
    			append_dev(div5, label5);
    			append_dev(div5, t40);
    			append_dev(div5, input10);
    			set_input_value(input10, /*l_pan*/ ctx[5]);
    			append_dev(td11, t41);
    			append_dev(td11, p2);
    			append_dev(p2, t42);
    			append_dev(p2, input11);
    			set_input_value(input11, /*l_pan*/ ctx[5]);
    			append_dev(p2, t43);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[11]),
    					listen_dev(input1, "change", /*input1_change_input_handler*/ ctx[12]),
    					listen_dev(input1, "input", /*input1_change_input_handler*/ ctx[12]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[13]),
    					listen_dev(input3, "change", /*input3_change_input_handler*/ ctx[14]),
    					listen_dev(input3, "input", /*input3_change_input_handler*/ ctx[14]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[15]),
    					listen_dev(input5, "change", /*input5_change_input_handler*/ ctx[16]),
    					listen_dev(input5, "input", /*input5_change_input_handler*/ ctx[16]),
    					listen_dev(input6, "input", /*input6_input_handler*/ ctx[17]),
    					listen_dev(input7, "change", /*input7_change_input_handler*/ ctx[18]),
    					listen_dev(input7, "input", /*input7_change_input_handler*/ ctx[18]),
    					listen_dev(input8, "input", /*input8_input_handler*/ ctx[19]),
    					listen_dev(input9, "change", /*input9_change_input_handler*/ ctx[20]),
    					listen_dev(input9, "input", /*input9_change_input_handler*/ ctx[20]),
    					listen_dev(input10, "input", /*input10_input_handler*/ ctx[21]),
    					listen_dev(input11, "change", /*input11_change_input_handler*/ ctx[22]),
    					listen_dev(input11, "input", /*input11_change_input_handler*/ ctx[22])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*u1_name*/ 128) set_data_dev(t0, /*u1_name*/ ctx[7]);
    			if (dirty & /*u2_name*/ 256) set_data_dev(t3, /*u2_name*/ ctx[8]);
    			if (dirty & /*l_name*/ 512) set_data_dev(t6, /*l_name*/ ctx[9]);

    			if (dirty & /*index*/ 64) {
    				set_style(tr0, "background-color", lum(cfg.slotcolors_B[/*index*/ ctx[6]], -0.3));
    			}

    			if (dirty & /*names*/ 1024 && t9_value !== (t9_value = /*names*/ ctx[10]["u1"] + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*names*/ 1024 && t11_value !== (t11_value = /*names*/ ctx[10]["u2"] + "")) set_data_dev(t11, t11_value);
    			if (dirty & /*names*/ 1024 && t13_value !== (t13_value = /*names*/ ctx[10]["l"] + "")) set_data_dev(t13, t13_value);

    			if (dirty & /*index*/ 64) {
    				set_style(tr1, "background-color", lum(cfg.slotcolors_B[/*index*/ ctx[6]], 0.1));
    			}

    			if (dirty & /*index*/ 64 && input0_name_value !== (input0_name_value = "" + (/*index*/ ctx[6] + "_u1_vol"))) {
    				attr_dev(input0, "name", input0_name_value);
    			}

    			if (dirty & /*u1_vol*/ 1 && input0.value !== /*u1_vol*/ ctx[0]) {
    				set_input_value(input0, /*u1_vol*/ ctx[0]);
    			}

    			if (dirty & /*u1_vol*/ 1) {
    				set_input_value(input1, /*u1_vol*/ ctx[0]);
    			}

    			if (dirty & /*index*/ 64 && input2_name_value !== (input2_name_value = "" + (/*index*/ ctx[6] + "_u2_vol"))) {
    				attr_dev(input2, "name", input2_name_value);
    			}

    			if (dirty & /*u2_vol*/ 4 && input2.value !== /*u2_vol*/ ctx[2]) {
    				set_input_value(input2, /*u2_vol*/ ctx[2]);
    			}

    			if (dirty & /*u2_vol*/ 4) {
    				set_input_value(input3, /*u2_vol*/ ctx[2]);
    			}

    			if (dirty & /*index*/ 64 && input4_name_value !== (input4_name_value = "" + (/*index*/ ctx[6] + "_l_vol"))) {
    				attr_dev(input4, "name", input4_name_value);
    			}

    			if (dirty & /*l_vol*/ 16 && input4.value !== /*l_vol*/ ctx[4]) {
    				set_input_value(input4, /*l_vol*/ ctx[4]);
    			}

    			if (dirty & /*l_vol*/ 16) {
    				set_input_value(input5, /*l_vol*/ ctx[4]);
    			}

    			if (dirty & /*index*/ 64) {
    				set_style(tr2, "background-color", lum(cfg.slotcolors_B[/*index*/ ctx[6]], 0.75));
    			}

    			if (dirty & /*index*/ 64 && input6_name_value !== (input6_name_value = "" + (/*index*/ ctx[6] + "_u1_pan"))) {
    				attr_dev(input6, "name", input6_name_value);
    			}

    			if (dirty & /*u1_pan*/ 2 && input6.value !== /*u1_pan*/ ctx[1]) {
    				set_input_value(input6, /*u1_pan*/ ctx[1]);
    			}

    			if (dirty & /*u1_pan*/ 2) {
    				set_input_value(input7, /*u1_pan*/ ctx[1]);
    			}

    			if (dirty & /*index*/ 64 && input8_name_value !== (input8_name_value = "" + (/*index*/ ctx[6] + "_u2_pan"))) {
    				attr_dev(input8, "name", input8_name_value);
    			}

    			if (dirty & /*u2_pan*/ 8 && input8.value !== /*u2_pan*/ ctx[3]) {
    				set_input_value(input8, /*u2_pan*/ ctx[3]);
    			}

    			if (dirty & /*u2_pan*/ 8) {
    				set_input_value(input9, /*u2_pan*/ ctx[3]);
    			}

    			if (dirty & /*index*/ 64 && input10_name_value !== (input10_name_value = "" + (/*index*/ ctx[6] + "_l_pan"))) {
    				attr_dev(input10, "name", input10_name_value);
    			}

    			if (dirty & /*l_pan*/ 32 && input10.value !== /*l_pan*/ ctx[5]) {
    				set_input_value(input10, /*l_pan*/ ctx[5]);
    			}

    			if (dirty & /*l_pan*/ 32) {
    				set_input_value(input11, /*l_pan*/ ctx[5]);
    			}

    			if (dirty & /*index*/ 64) {
    				set_style(tr3, "background-color", lum(cfg.slotcolors_B[/*index*/ ctx[6]], 0.99));
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function lum(hex, lum) {
    	// validate hex string
    	hex = String(hex).replace(/[^0-9a-f]/gi, "");

    	if (hex.length < 6) {
    		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    	}

    	lum = lum || 0;

    	// convert to decimal and change luminosity
    	var rgb = "#", c, i;

    	for (i = 0; i < 3; i++) {
    		c = parseInt(hex.substr(i * 2, 2), 16);
    		c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
    		rgb += ("00" + c).substr(c.length);
    	}

    	return rgb;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("RegSlot", slots, []);

    	let { index } = $$props,
    		{ u1_name } = $$props,
    		{ u1_vol } = $$props,
    		{ u1_pan } = $$props,
    		{ u2_name } = $$props,
    		{ u2_vol } = $$props,
    		{ u2_pan } = $$props,
    		{ l_name } = $$props,
    		{ l_vol } = $$props,
    		{ l_pan } = $$props,
    		{ names } = $$props;

    	const writable_props = [
    		"index",
    		"u1_name",
    		"u1_vol",
    		"u1_pan",
    		"u2_name",
    		"u2_vol",
    		"u2_pan",
    		"l_name",
    		"l_vol",
    		"l_pan",
    		"names"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RegSlot> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		u1_vol = this.value;
    		$$invalidate(0, u1_vol);
    	}

    	function input1_change_input_handler() {
    		u1_vol = to_number(this.value);
    		$$invalidate(0, u1_vol);
    	}

    	function input2_input_handler() {
    		u2_vol = this.value;
    		$$invalidate(2, u2_vol);
    	}

    	function input3_change_input_handler() {
    		u2_vol = to_number(this.value);
    		$$invalidate(2, u2_vol);
    	}

    	function input4_input_handler() {
    		l_vol = this.value;
    		$$invalidate(4, l_vol);
    	}

    	function input5_change_input_handler() {
    		l_vol = to_number(this.value);
    		$$invalidate(4, l_vol);
    	}

    	function input6_input_handler() {
    		u1_pan = this.value;
    		$$invalidate(1, u1_pan);
    	}

    	function input7_change_input_handler() {
    		u1_pan = to_number(this.value);
    		$$invalidate(1, u1_pan);
    	}

    	function input8_input_handler() {
    		u2_pan = this.value;
    		$$invalidate(3, u2_pan);
    	}

    	function input9_change_input_handler() {
    		u2_pan = to_number(this.value);
    		$$invalidate(3, u2_pan);
    	}

    	function input10_input_handler() {
    		l_pan = this.value;
    		$$invalidate(5, l_pan);
    	}

    	function input11_change_input_handler() {
    		l_pan = to_number(this.value);
    		$$invalidate(5, l_pan);
    	}

    	$$self.$$set = $$props => {
    		if ("index" in $$props) $$invalidate(6, index = $$props.index);
    		if ("u1_name" in $$props) $$invalidate(7, u1_name = $$props.u1_name);
    		if ("u1_vol" in $$props) $$invalidate(0, u1_vol = $$props.u1_vol);
    		if ("u1_pan" in $$props) $$invalidate(1, u1_pan = $$props.u1_pan);
    		if ("u2_name" in $$props) $$invalidate(8, u2_name = $$props.u2_name);
    		if ("u2_vol" in $$props) $$invalidate(2, u2_vol = $$props.u2_vol);
    		if ("u2_pan" in $$props) $$invalidate(3, u2_pan = $$props.u2_pan);
    		if ("l_name" in $$props) $$invalidate(9, l_name = $$props.l_name);
    		if ("l_vol" in $$props) $$invalidate(4, l_vol = $$props.l_vol);
    		if ("l_pan" in $$props) $$invalidate(5, l_pan = $$props.l_pan);
    		if ("names" in $$props) $$invalidate(10, names = $$props.names);
    	};

    	$$self.$capture_state = () => ({
    		cfg,
    		index,
    		u1_name,
    		u1_vol,
    		u1_pan,
    		u2_name,
    		u2_vol,
    		u2_pan,
    		l_name,
    		l_vol,
    		l_pan,
    		names,
    		lum
    	});

    	$$self.$inject_state = $$props => {
    		if ("index" in $$props) $$invalidate(6, index = $$props.index);
    		if ("u1_name" in $$props) $$invalidate(7, u1_name = $$props.u1_name);
    		if ("u1_vol" in $$props) $$invalidate(0, u1_vol = $$props.u1_vol);
    		if ("u1_pan" in $$props) $$invalidate(1, u1_pan = $$props.u1_pan);
    		if ("u2_name" in $$props) $$invalidate(8, u2_name = $$props.u2_name);
    		if ("u2_vol" in $$props) $$invalidate(2, u2_vol = $$props.u2_vol);
    		if ("u2_pan" in $$props) $$invalidate(3, u2_pan = $$props.u2_pan);
    		if ("l_name" in $$props) $$invalidate(9, l_name = $$props.l_name);
    		if ("l_vol" in $$props) $$invalidate(4, l_vol = $$props.l_vol);
    		if ("l_pan" in $$props) $$invalidate(5, l_pan = $$props.l_pan);
    		if ("names" in $$props) $$invalidate(10, names = $$props.names);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		u1_vol,
    		u1_pan,
    		u2_vol,
    		u2_pan,
    		l_vol,
    		l_pan,
    		index,
    		u1_name,
    		u2_name,
    		l_name,
    		names,
    		input0_input_handler,
    		input1_change_input_handler,
    		input2_input_handler,
    		input3_change_input_handler,
    		input4_input_handler,
    		input5_change_input_handler,
    		input6_input_handler,
    		input7_change_input_handler,
    		input8_input_handler,
    		input9_change_input_handler,
    		input10_input_handler,
    		input11_change_input_handler
    	];
    }

    class RegSlot extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			index: 6,
    			u1_name: 7,
    			u1_vol: 0,
    			u1_pan: 1,
    			u2_name: 8,
    			u2_vol: 2,
    			u2_pan: 3,
    			l_name: 9,
    			l_vol: 4,
    			l_pan: 5,
    			names: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RegSlot",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*index*/ ctx[6] === undefined && !("index" in props)) {
    			console.warn("<RegSlot> was created without expected prop 'index'");
    		}

    		if (/*u1_name*/ ctx[7] === undefined && !("u1_name" in props)) {
    			console.warn("<RegSlot> was created without expected prop 'u1_name'");
    		}

    		if (/*u1_vol*/ ctx[0] === undefined && !("u1_vol" in props)) {
    			console.warn("<RegSlot> was created without expected prop 'u1_vol'");
    		}

    		if (/*u1_pan*/ ctx[1] === undefined && !("u1_pan" in props)) {
    			console.warn("<RegSlot> was created without expected prop 'u1_pan'");
    		}

    		if (/*u2_name*/ ctx[8] === undefined && !("u2_name" in props)) {
    			console.warn("<RegSlot> was created without expected prop 'u2_name'");
    		}

    		if (/*u2_vol*/ ctx[2] === undefined && !("u2_vol" in props)) {
    			console.warn("<RegSlot> was created without expected prop 'u2_vol'");
    		}

    		if (/*u2_pan*/ ctx[3] === undefined && !("u2_pan" in props)) {
    			console.warn("<RegSlot> was created without expected prop 'u2_pan'");
    		}

    		if (/*l_name*/ ctx[9] === undefined && !("l_name" in props)) {
    			console.warn("<RegSlot> was created without expected prop 'l_name'");
    		}

    		if (/*l_vol*/ ctx[4] === undefined && !("l_vol" in props)) {
    			console.warn("<RegSlot> was created without expected prop 'l_vol'");
    		}

    		if (/*l_pan*/ ctx[5] === undefined && !("l_pan" in props)) {
    			console.warn("<RegSlot> was created without expected prop 'l_pan'");
    		}

    		if (/*names*/ ctx[10] === undefined && !("names" in props)) {
    			console.warn("<RegSlot> was created without expected prop 'names'");
    		}
    	}

    	get index() {
    		throw new Error("<RegSlot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<RegSlot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get u1_name() {
    		throw new Error("<RegSlot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set u1_name(value) {
    		throw new Error("<RegSlot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get u1_vol() {
    		throw new Error("<RegSlot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set u1_vol(value) {
    		throw new Error("<RegSlot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get u1_pan() {
    		throw new Error("<RegSlot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set u1_pan(value) {
    		throw new Error("<RegSlot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get u2_name() {
    		throw new Error("<RegSlot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set u2_name(value) {
    		throw new Error("<RegSlot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get u2_vol() {
    		throw new Error("<RegSlot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set u2_vol(value) {
    		throw new Error("<RegSlot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get u2_pan() {
    		throw new Error("<RegSlot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set u2_pan(value) {
    		throw new Error("<RegSlot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get l_name() {
    		throw new Error("<RegSlot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set l_name(value) {
    		throw new Error("<RegSlot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get l_vol() {
    		throw new Error("<RegSlot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set l_vol(value) {
    		throw new Error("<RegSlot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get l_pan() {
    		throw new Error("<RegSlot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set l_pan(value) {
    		throw new Error("<RegSlot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get names() {
    		throw new Error("<RegSlot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set names(value) {
    		throw new Error("<RegSlot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function openFile(e) {
        e.preventDefault();
        const dialog = window.__TAURI__.dialog;
        const fileRelativeLoc = '../../file';
        dialog.open({
            'defaultPath': fileRelativeLoc,
            'filters': [{
                name: 'casio_rbk',
                extensions: ['rbk']
            }]
        });
    }

    /* src/LibCtrl.svelte generated by Svelte v3.38.2 */

    const file$1 = "src/LibCtrl.svelte";

    function create_fragment$1(ctx) {
    	let div2;
    	let div0;
    	let h2;
    	let t1;
    	let h4;
    	let t3;
    	let div1;
    	let input;
    	let t4;
    	let br;
    	let t5;
    	let button0;
    	let a;
    	let t6;
    	let a_href_value;
    	let t7;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "RBK Mixer";
    			t1 = space();
    			h4 = element("h4");
    			h4.textContent = "CT-X700/X800/CDP-S350 RBK File Editor";
    			t3 = space();
    			div1 = element("div");
    			input = element("input");
    			t4 = space();
    			br = element("br");
    			t5 = space();
    			button0 = element("button");
    			a = element("a");
    			t6 = text("Import RBK File");
    			t7 = space();
    			button1 = element("button");
    			button1.textContent = "Export RBK File";
    			add_location(h2, file$1, 34, 8, 1023);
    			add_location(h4, file$1, 35, 8, 1050);
    			add_location(div0, file$1, 33, 4, 1009);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "input-filename");
    			attr_dev(input, "name", "filename");
    			add_location(input, file$1, 41, 8, 1307);
    			add_location(br, file$1, 42, 8, 1398);
    			attr_dev(a, "href", a_href_value = "" + (/*server*/ ctx[0] + "/import?filename=" + /*$filename*/ ctx[1]));
    			attr_dev(a, "class", "svelte-g4wi1v");
    			add_location(a, file$1, 44, 12, 1434);
    			add_location(button0, file$1, 43, 8, 1412);
    			add_location(button1, file$1, 47, 8, 1564);
    			set_style(div1, "padding-top", "22px");
    			set_style(div1, "text-align", "left");
    			add_location(div1, file$1, 40, 4, 1250);
    			attr_dev(div2, "id", "libctrl");
    			attr_dev(div2, "class", "svelte-g4wi1v");
    			add_location(div2, file$1, 32, 0, 986);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h2);
    			append_dev(div0, t1);
    			append_dev(div0, h4);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, input);
    			set_input_value(input, /*$filename*/ ctx[1]);
    			append_dev(div1, t4);
    			append_dev(div1, br);
    			append_dev(div1, t5);
    			append_dev(div1, button0);
    			append_dev(button0, a);
    			append_dev(a, t6);
    			append_dev(div1, t7);
    			append_dev(div1, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[2]),
    					listen_dev(button1, "click", handleExport, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$filename*/ 2 && input.value !== /*$filename*/ ctx[1]) {
    				set_input_value(input, /*$filename*/ ctx[1]);
    			}

    			if (dirty & /*server, $filename*/ 3 && a_href_value !== (a_href_value = "" + (/*server*/ ctx[0] + "/import?filename=" + /*$filename*/ ctx[1]))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handleImport(e, serv, file) {
    	e.preventDefault();
    	href.location = serv + "/import?filename=" + file;
    }

    function handleExport(e) {
    	e.preventDefault();
    	var form = document.getElementById("slotsbox");
    	form.submit();
    }

    function allowDrop(e) {
    	e.preventDefault();
    }

    function drop(e) {
    	e.preventDefault();
    	var dropfilename = e.dataTransfer.dataTransfer.files[0].name;
    	var xhr = new XMLHttpRequest();
    	xhr.open("GET", "/import", true);

    	xhr.onload = function () {
    		
    	}; // Request finished. Do processing here.

    	xhr.send(dropfilename);
    	filename.update(dropfilename);
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $filename;
    	validate_store(filename, "filename");
    	component_subscribe($$self, filename, $$value => $$invalidate(1, $filename = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LibCtrl", slots, []);
    	let { server } = $$props;
    	const writable_props = ["server"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LibCtrl> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		$filename = this.value;
    		filename.set($filename);
    	}

    	$$self.$$set = $$props => {
    		if ("server" in $$props) $$invalidate(0, server = $$props.server);
    	};

    	$$self.$capture_state = () => ({
    		handleImport,
    		handleExport,
    		allowDrop,
    		drop,
    		filename,
    		openFile,
    		server,
    		$filename
    	});

    	$$self.$inject_state = $$props => {
    		if ("server" in $$props) $$invalidate(0, server = $$props.server);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [server, $filename, input_input_handler];
    }

    class LibCtrl extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { server: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LibCtrl",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*server*/ ctx[0] === undefined && !("server" in props)) {
    			console.warn("<LibCtrl> was created without expected prop 'server'");
    		}
    	}

    	get server() {
    		throw new Error("<LibCtrl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set server(value) {
    		throw new Error("<LibCtrl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.38.2 */
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (33:2) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "loading...";
    			attr_dev(p, "class", "loading svelte-pgjas5");
    			add_location(p, file, 33, 3, 831);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(33:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (16:2) {#each $slots as slot, i}
    function create_each_block(ctx) {
    	let div;
    	let h3;
    	let t0;
    	let t1_value = /*i*/ ctx[8] + 1 + "";
    	let t1;
    	let t2;
    	let regslot;
    	let t3;
    	let current;

    	regslot = new RegSlot({
    			props: {
    				index: /*i*/ ctx[8],
    				u1_name: /*u1_label*/ ctx[0],
    				u1_vol: /*slot*/ ctx[6].u1.vol,
    				u1_pan: /*slot*/ ctx[6].u1.pan,
    				u2_name: /*u2_label*/ ctx[1],
    				u2_vol: /*slot*/ ctx[6].u2.vol,
    				u2_pan: /*slot*/ ctx[6].u2.pan,
    				l_name: /*l_label*/ ctx[2],
    				l_vol: /*slot*/ ctx[6].l.vol,
    				l_pan: /*slot*/ ctx[6].l.pan,
    				names: /*$names*/ ctx[5][/*i*/ ctx[8]]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text("Registration Slot ");
    			t1 = text(t1_value);
    			t2 = space();
    			create_component(regslot.$$.fragment);
    			t3 = space();
    			add_location(h3, file, 17, 4, 494);
    			attr_dev(div, "class", "slot svelte-pgjas5");
    			add_location(div, file, 16, 3, 471);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    			append_dev(div, t2);
    			mount_component(regslot, div, null);
    			append_dev(div, t3);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const regslot_changes = {};
    			if (dirty & /*u1_label*/ 1) regslot_changes.u1_name = /*u1_label*/ ctx[0];
    			if (dirty & /*$slots*/ 16) regslot_changes.u1_vol = /*slot*/ ctx[6].u1.vol;
    			if (dirty & /*$slots*/ 16) regslot_changes.u1_pan = /*slot*/ ctx[6].u1.pan;
    			if (dirty & /*u2_label*/ 2) regslot_changes.u2_name = /*u2_label*/ ctx[1];
    			if (dirty & /*$slots*/ 16) regslot_changes.u2_vol = /*slot*/ ctx[6].u2.vol;
    			if (dirty & /*$slots*/ 16) regslot_changes.u2_pan = /*slot*/ ctx[6].u2.pan;
    			if (dirty & /*l_label*/ 4) regslot_changes.l_name = /*l_label*/ ctx[2];
    			if (dirty & /*$slots*/ 16) regslot_changes.l_vol = /*slot*/ ctx[6].l.vol;
    			if (dirty & /*$slots*/ 16) regslot_changes.l_pan = /*slot*/ ctx[6].l.pan;
    			if (dirty & /*$names*/ 32) regslot_changes.names = /*$names*/ ctx[5][/*i*/ ctx[8]];
    			regslot.$set(regslot_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(regslot.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(regslot.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(regslot);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(16:2) {#each $slots as slot, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let form;
    	let libctrl;
    	let t;
    	let form_action_value;
    	let current;

    	libctrl = new LibCtrl({
    			props: { server: /*server*/ ctx[3] },
    			$$inline: true
    		});

    	let each_value = /*$slots*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block(ctx);
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			form = element("form");
    			create_component(libctrl.$$.fragment);
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			attr_dev(form, "id", "slotsbox");
    			attr_dev(form, "action", form_action_value = "" + (/*server*/ ctx[3] + "/export"));
    			attr_dev(form, "method", "post");
    			attr_dev(form, "class", "svelte-pgjas5");
    			add_location(form, file, 13, 1, 351);
    			attr_dev(main, "class", "svelte-pgjas5");
    			add_location(main, file, 12, 0, 343);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, form);
    			mount_component(libctrl, form, null);
    			append_dev(form, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(form, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(form, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const libctrl_changes = {};
    			if (dirty & /*server*/ 8) libctrl_changes.server = /*server*/ ctx[3];
    			libctrl.$set(libctrl_changes);

    			if (dirty & /*u1_label, $slots, u2_label, l_label, $names*/ 55) {
    				each_value = /*$slots*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(form, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();

    				if (each_value.length) {
    					if (each_1_else) {
    						each_1_else.d(1);
    						each_1_else = null;
    					}
    				} else if (!each_1_else) {
    					each_1_else = create_else_block(ctx);
    					each_1_else.c();
    					each_1_else.m(form, null);
    				}
    			}

    			if (!current || dirty & /*server*/ 8 && form_action_value !== (form_action_value = "" + (/*server*/ ctx[3] + "/export"))) {
    				attr_dev(form, "action", form_action_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(libctrl.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(libctrl.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(libctrl);
    			destroy_each(each_blocks, detaching);
    			if (each_1_else) each_1_else.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $slots;
    	let $names;
    	validate_store(slots, "slots");
    	component_subscribe($$self, slots, $$value => $$invalidate(4, $slots = $$value));
    	validate_store(names, "names");
    	component_subscribe($$self, names, $$value => $$invalidate(5, $names = $$value));
    	let { $$slots: slots$1 = {}, $$scope } = $$props;
    	validate_slots("App", slots$1, []);

    	let { u1_label } = $$props,
    		{ u2_label } = $$props,
    		{ l_label } = $$props,
    		{ server } = $$props;

    	onMount(async () => {
    		await updateSlots(server);
    		await updateNames(server);
    	});

    	const writable_props = ["u1_label", "u2_label", "l_label", "server"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("u1_label" in $$props) $$invalidate(0, u1_label = $$props.u1_label);
    		if ("u2_label" in $$props) $$invalidate(1, u2_label = $$props.u2_label);
    		if ("l_label" in $$props) $$invalidate(2, l_label = $$props.l_label);
    		if ("server" in $$props) $$invalidate(3, server = $$props.server);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		slots,
    		names,
    		updateSlots,
    		updateNames,
    		RegSlot,
    		LibCtrl,
    		u1_label,
    		u2_label,
    		l_label,
    		server,
    		$slots,
    		$names
    	});

    	$$self.$inject_state = $$props => {
    		if ("u1_label" in $$props) $$invalidate(0, u1_label = $$props.u1_label);
    		if ("u2_label" in $$props) $$invalidate(1, u2_label = $$props.u2_label);
    		if ("l_label" in $$props) $$invalidate(2, l_label = $$props.l_label);
    		if ("server" in $$props) $$invalidate(3, server = $$props.server);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [u1_label, u2_label, l_label, server, $slots, $names];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			u1_label: 0,
    			u2_label: 1,
    			l_label: 2,
    			server: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*u1_label*/ ctx[0] === undefined && !("u1_label" in props)) {
    			console.warn("<App> was created without expected prop 'u1_label'");
    		}

    		if (/*u2_label*/ ctx[1] === undefined && !("u2_label" in props)) {
    			console.warn("<App> was created without expected prop 'u2_label'");
    		}

    		if (/*l_label*/ ctx[2] === undefined && !("l_label" in props)) {
    			console.warn("<App> was created without expected prop 'l_label'");
    		}

    		if (/*server*/ ctx[3] === undefined && !("server" in props)) {
    			console.warn("<App> was created without expected prop 'server'");
    		}
    	}

    	get u1_label() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set u1_label(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get u2_label() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set u2_label(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get l_label() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set l_label(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get server() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set server(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		u1_label: "Upper 1",
    		u2_label: "Upper 2",
    		l_label: "Lower",
    		server: "http://localhost:5000"
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
