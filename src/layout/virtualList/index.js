import Vue from 'vue'
import lodash from 'lodash'

function getClassObject(str) {
    return lodash.reduce(str.split(" "), (acc, v) => {
        acc[v] = true;
        return acc;
    }, {});
}

// function isElementInViewport (el) {
//     const rect = el.getBoundingClientRect();
//     return (
//         rect.top >= 0 &&
//         rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
//         // && rect.left >= 0 &&
//         // rect.right <= (window.innerWidth || document.documentElement.clientWidth)
//     );
// }

function falseFn() { return false; }

const virtualList = Vue.component('virtualList',  {
    props: {
        size: {
            type: Number,
            required: true
        },
        remain: {
            type: Number,
            required: true
        },
        rtag: { type: String, default: 'div' },
        rtagStyle: { type: Object, default() { return {} } },
        rtagClass: { type: String, default: "" },
        wtag: { type: String, default: 'div' },
        wtagStyle: { type: Object, default() { return {} } },
        wtagClass: { type: String, default: "" },
        scrollMapperFn: Function, // will be passed in key & any attributes the div has. Only returned strings will be accepted into the map.
        onScroll: Function,
        permanentFn: Function
    },

    // an object helping to calculate
    delta: {
        start: 0, // start index
        end: 0, // end index
        total: 0, // all items count
        keeps: 0, // nums of item keeping in real dom
        viewHeight: 0, // container wrapper viewport height
        allPadding: 0, // all padding of not-render-yet doms
        paddingTop: 0, // container wrapper real padding-top
        scrollPositions: {} // (key, index) pairs generated from scrollMapperFn (if provided).
    },

    methods: {
        // scrolls to a position in the scrollPosition map
        scrollTo(position) {
            return new Promise((resolve, reject) => {
                const mappedScrollIndex = this.$options.delta.scrollPositions[position];
                if(!this.$refs.container || typeof mappedScrollIndex !== 'number')
                    return reject();

                return this.scrollToIndex(mappedScrollIndex).then(resolve).catch(reject);
            })
        },
        // scrolls to an index within the list.
        scrollToIndex(index) {
            return new Promise((resolve, reject) => {
                if(!this.$refs.container && index >= 0 && index < this.$slots.default.length)
                    return reject();

                this.$refs.container.scrollTop = index * this.size;
                return resolve();
            })
        },

        handleScroll(e) {
            // console.log(`handleScroll`);
            if(!this.$refs.container)
                return;

            const scrollTop = this.$refs.container.scrollTop
            this.updateZone(scrollTop)

            if (typeof this.onScroll === `function` && e) {
                this.onScroll(e, scrollTop)
            }
        },

        updateZone(offset) {
            const delta = this.$options.delta
            const overs = Math.floor(offset / this.size)
            // console.log(overs, delta.total, this.remain);

            if (!offset && delta.total) {
                this.$emit('toTop')
            }

            // need moving items at lease one unit height
            // @todo: consider prolong the zone range size
            let start = overs || 0
            let end = overs ? (overs + delta.keeps) : delta.keeps
            const isOverflow = delta.total - delta.keeps > 0

            // avoid overflow range
            if (isOverflow && overs + this.remain >= delta.total) {
                end = delta.total
                start = delta.total - delta.keeps
                this.$emit('toBottom')
            }

            delta.end = end
            delta.start = start

            // call component to update shown items
            this.$forceUpdate()
        },

        refresh() {
            const self = this;
            if(!self || !self.$refs.container)
                return;

            // eh somewhat of a hack but this should force the view to refresh.
            const startScroll = this.$refs.container.scrollTop
            setTimeout(() => {
                if(!self || !self.$refs.container)
                    return;

                self.$refs.container.scrollTop = startScroll + 1;
                self.$refs.container.scrollTop = startScroll - 1;
            }, 200)
        },

        updateScrollPositions(slots) {
            if(typeof this.scrollMapperFn !== 'function'){
                this.$options.delta.scrollPositions = {};
                return;
            }

            this.$options.delta.scrollPositions = slots.reduce((acc, { data }, index) => {
                if(!data)
                    return acc;

                const key = data.key;
                const attr = data.attrs;
                const result = this.scrollMapperFn(key, attr);
                if(typeof result === 'string' && acc[result] === undefined) {
                    acc[result] = index;
                }

                return acc;
            }, {})
            // console.log(this.$options.delta.scrollPositions);
        },

        filter(slotsArr) {
            const delta = this.$options.delta
            const slots = slotsArr || [];
            const permanentFn = typeof this.permanentFn === 'function' ? this.permanentFn : falseFn;

            if(delta.total !== slots.length || slots.length === 0) {
                delta.start = 0
                // console.log('ayyyye')
                // reset scroll to top.
                if(this.$refs.container)
                    this.$refs.container.scrollTop = 0;

                // if our len is different, then we can update our mapped scroll indices.
                this.updateScrollPositions(slots);
            }

            const results = slots.filter((slot, index) => {
                try {
                    return permanentFn(slot, index) || (index >= delta.start && index <= delta.end)
                } catch(e) {
                    return index >= delta.start && index <= delta.end
                }
            })

            // if there's no results, we can safely just go back top!
            if(results.length === 0)
                delta.start = 0;

            // console.log(delta.start);
            delta.paddingTop =  this.size * delta.start;
            delta.allPadding = Math.max(0, this.size * (slots.length - delta.keeps));
            delta.total = slots.length

            return results;
        },
    },

    beforeMount() {
        // doInit(this.$options.delta, this.size, this.remain);
        const remains = this.remain;
        const delta = this.$options.delta;
        const benchs = Math.round(remains / 2);

        delta.end = remains + benchs;
        delta.keeps = remains + benchs;
        delta.viewHeight = this.size * remains;
    },

    watch: {
        size(n) {
            const remains = this.remain;
            const delta = this.$options.delta;
            const benchs = Math.round(remains / 2);

            delta.end = remains + benchs;
            delta.keeps = remains + benchs;
            delta.viewHeight = n * remains;
            this.handleScroll();
        }
    },

    render(createElement) {
        const showList = this.filter(this.$slots.default)
        const delta = this.$options.delta
        // console.log(`render`)

        return createElement(this.rtag, {
            attrs: {
                id: `virtualList-${new Date().getTime()}-${Math.random() * 1000}`,
                // name: 'scrollMeBro',
            },
            ref: 'container',
            style: lodash.assign({}, {
                display: 'block',
                'overflow-y': 'auto',
                height: `${delta.viewHeight}px`
            }, this.rtagStyle),
            class: getClassObject(this.rtagClass),
            on: {
                scroll: this.handleScroll
            },
        }, [
            createElement(this.wtag, {
                class: getClassObject(this.wtagClass),
                style: lodash.assign({}, {
                    display: 'block',
                    'padding-top': `${delta.paddingTop}px`,
                    'padding-bottom': `${delta.allPadding - delta.paddingTop}px`
                }, this.wtagStyle)
            }, showList)
        ])
    }
})

export default virtualList;
