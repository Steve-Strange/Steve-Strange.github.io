class CircularQueue {
    _elements;
    _capacity;
    _size;
    _start;
    _end;
    _destroyed;
    constructor(props) {
        const { capacity } = props;
        if (!Number.isInteger(capacity) || capacity < 1) {
            throw new RangeError(`[CircularQueue] capacity is expected to be a positive integer, but got (${capacity}).`);
        }
        this._elements = new Array(capacity);
        this._capacity = capacity;
        this._size = 0;
        this._start = 0;
        this._end = -1;
        this._destroyed = false;
    }
    *[Symbol.iterator]() {
        const { _elements, _capacity, _size, _start, _end } = this;
        if (_size === 0)
            return;
        if (_start <= _end) {
            for (let i = _start; i <= _end; ++i)
                yield _elements[i];
        }
        else {
            for (let i = _start; i < _capacity; ++i)
                yield _elements[i];
            for (let i = 0; i <= _end; ++i)
                yield _elements[i];
        }
    }
    get destroyed() {
        return this._destroyed;
    }
    get size() {
        return this._size;
    }
    at(index) {
        if (index < 0 || index >= this._size)
            return undefined;
        let idx = this._start + index;
        if (idx >= this._capacity)
            idx -= this._capacity;
        return this._elements[idx];
    }
    count(filter) {
        const { _elements, _capacity, _size, _start, _end } = this;
        if (_size === 0)
            return 0;
        let count = 0;
        if (_start <= _end) {
            for (let i = _start; i <= _end; ++i)
                if (filter(_elements[i]))
                    count += 1;
        }
        else {
            for (let i = _start; i < _capacity; ++i)
                if (filter(_elements[i]))
                    count += 1;
            for (let i = 0; i <= _end; ++i)
                if (filter(_elements[i]))
                    count += 1;
        }
        return count;
    }
    front() {
        return this._size === 0 ? undefined : this._elements[this._start];
    }
    back() {
        return this._size === 0 ? undefined : this._elements[this._end];
    }
    destroy() {
        if (this._destroyed)
            return;
        this._destroyed = true;
        this._elements.length = 0;
        this._size = 0;
        this._start = 0;
        this._end = -1;
    }
    init(initialElements) {
        if (this._destroyed) {
            throw new Error('[CircularQueue] `init` is not allowed since it has been destroyed');
        }
        const _elements = this._elements;
        const capacity = this._capacity;
        let size = 0;
        let start = 0;
        let end = -1;
        if (initialElements !== undefined) {
            for (const element of initialElements) {
                size += 1;
                end = end + 1 === capacity ? 0 : end + 1;
                _elements[end] = element;
            }
            if (size > capacity) {
                size = capacity;
                start = end + 1 === capacity ? 0 : end + 1;
            }
        }
        this._size = size;
        this._start = start;
        this._end = end;
    }
    resize(newCapacity) {
        if (!Number.isInteger(newCapacity) || newCapacity < 1) {
            throw new RangeError(`[CircularQueue] capacity is expected to be a positive integer, but got (${newCapacity}).`);
        }
        if (this._size > newCapacity) {
            throw new RangeError('[CircularQueue] failed to resize, the new queue space is insufficient.');
        }
        this.rearrange();
        this._capacity = newCapacity;
        this._elements.length = newCapacity;
    }
    rearrange() {
        if (this._start === 0)
            return;
        const elements = this._elements;
        const capacity = this._capacity;
        const size = this._size;
        const start = this._start;
        const end = this._end;
        if (start <= end) {
            let i = -1;
            for (let k = start; i < size; ++k) {
                i += 1;
                elements[i] = elements[k];
            }
        }
        else {
            let i = -1;
            const tmpArray = elements.slice(0, end + 1);
            for (let k = start; k < capacity; ++k) {
                i += 1;
                elements[i] = elements[k];
            }
            for (const element of tmpArray) {
                i += 1;
                elements[i] = element;
            }
            tmpArray.length = 0;
        }
        this._start = 0;
        this._end = size - 1;
    }
    *consuming() {
        while (this._size > 0) {
            const target = this._elements[this._start];
            this._size -= 1;
            this._start = this._start + 1 === this._capacity ? 0 : this._start + 1;
            yield target;
        }
        this._size = 0;
        this._start = 0;
        this._end = -1;
    }
    dequeue(newElement) {
        if (this._size === 0) {
            if (newElement !== undefined) {
                this._size = 1;
                this._start = 0;
                this._end = 0;
                this._elements[0] = newElement;
            }
            return undefined;
        }
        const target = this._elements[this._start];
        if (this._size === 1) {
            if (newElement === undefined) {
                this._size = 0;
                this._start = 0;
                this._end = -1;
            }
            else {
                this._size = 1;
                this._start = 0;
                this._end = 0;
                this._elements[0] = newElement;
            }
            return target;
        }
        this._start = this._start + 1 === this._capacity ? 0 : this._start + 1;
        if (newElement === undefined)
            this._size -= 1;
        else {
            this._end = this._end + 1 === this._capacity ? 0 : this._end + 1;
            this._elements[this._end] = newElement;
        }
        return target;
    }
    enqueue(element) {
        this._end = this._end + 1 === this._capacity ? 0 : this._end + 1;
        this._elements[this._end] = element;
        if (this._size < this._capacity)
            this._size += 1;
        else
            this._start = this._start + 1 === this._capacity ? 0 : this._start + 1;
    }
    enqueues(elements) {
        const _elements = this._elements;
        const capacity = this._capacity;
        let size = this._size;
        let start = this._start;
        let end = this._end;
        for (const element of elements) {
            size += 1;
            end = end + 1 === capacity ? 0 : end + 1;
            _elements[end] = element;
        }
        if (size > capacity) {
            size = capacity;
            start = end + 1 === capacity ? 0 : end + 1;
        }
        this._size = size;
        this._start = start;
        this._end = end;
    }
    enqueues_advance(elements, start, end) {
        if (end <= start)
            return;
        const _elements = this._elements;
        const capacity = this._capacity;
        const count = end - start;
        if (count >= capacity) {
            let _end = -1;
            for (let i = end - capacity; i < end; ++i) {
                _end += 1;
                _elements[_end] = elements[i];
            }
            this._size = capacity;
            this._start = 0;
            this._end = capacity - 1;
            return;
        }
        {
            let _end = this._end;
            for (let i = start; i < end; ++i) {
                _end = _end + 1 === capacity ? 0 : _end + 1;
                _elements[_end] = elements[i];
            }
            const size = this._size + count;
            if (size < capacity) {
                this._size = size;
                this._end = _end;
            }
            else {
                const nextStart = this._start + size - capacity;
                this._size = capacity;
                this._end = _end;
                this._start = nextStart >= capacity ? nextStart - capacity : nextStart;
            }
        }
    }
    exclude(filter) {
        if (this._size === 0)
            return 0;
        const elements = this._elements;
        const capacity = this._capacity;
        const start = this._start;
        const end = this._end;
        let size = 0;
        if (start <= end) {
            for (let k = start; k <= end; ++k) {
                const element = elements[k];
                if (filter(element))
                    continue;
                elements[size] = element;
                size += 1;
            }
        }
        else {
            const tmpArray = elements.slice(0, end + 1);
            for (let k = start; k < capacity; ++k) {
                const element = elements[k];
                if (filter(element))
                    continue;
                elements[size] = element;
                size += 1;
            }
            for (const element of tmpArray) {
                if (filter(element))
                    continue;
                elements[size] = element;
                size += 1;
            }
            tmpArray.length = 0;
        }
        const removedSize = this._size - size;
        this._size = size;
        this._start = 0;
        this._end = size - 1;
        return removedSize;
    }
    dequeue_back() {
        if (this._size === 0)
            return undefined;
        const target = this._elements[this._end];
        if (this._size === 1) {
            this._size = 0;
            this._start = 0;
            this._end = -1;
            return target;
        }
        this._end = this._end === 0 ? this._capacity - 1 : this._end - 1;
        this._size -= 1;
        return target;
    }
    enqueue_front(element) {
        if (this._size === 0) {
            this._size = 1;
            this._start = 0;
            this._end = 0;
            this._elements[0] = element;
            return;
        }
        this._start = this._start === 0 ? this._capacity - 1 : this._start - 1;
        this._elements[this._start] = element;
        if (this._size < this._capacity)
            this._size += 1;
        else
            this._end = this._end === 0 ? this._capacity - 1 : this._end - 1;
    }
    enqueues_front(elements) {
        const _elements = this._elements;
        const capacity = this._capacity;
        let size = this._size;
        let start = this._start;
        let end = this._end;
        for (const element of elements) {
            size += 1;
            start = start === 0 ? capacity - 1 : start - 1;
            _elements[start] = element;
        }
        if (size > capacity) {
            size = capacity;
            end = start === 0 ? capacity - 1 : start - 1;
        }
        this._size = size;
        this._start = start;
        this._end = end;
    }
    enqueues_front_advance(elements, start, end) {
        if (end <= start)
            return;
        const _elements = this._elements;
        const capacity = this._capacity;
        const count = end - start;
        if (count >= capacity) {
            let _start = capacity;
            for (let i = end - capacity; i < end; ++i) {
                _start -= 1;
                _elements[_start] = elements[i];
            }
            this._size = capacity;
            this._start = 0;
            this._end = capacity - 1;
            return;
        }
        {
            let _start = this._start;
            for (let i = start; i < end; ++i) {
                _start = _start === 0 ? capacity - 1 : _start - 1;
                _elements[_start] = elements[i];
            }
            const size = this._size + count;
            if (size < capacity) {
                this._size = size;
                this._start = _start;
            }
            else {
                const nextEnd = this._end - size + capacity;
                this._size = capacity;
                this._start = _start;
                this._end = nextEnd < 0 ? nextEnd + capacity : nextEnd;
            }
        }
    }
}

class Deque {
    _pool;
    _poolSize;
    _size;
    _head;
    _tail;
    _destroyed;
    constructor() {
        this._pool = [];
        this._poolSize = 0;
        this._size = 0;
        this._head = undefined;
        this._tail = undefined;
        this._destroyed = false;
    }
    *[Symbol.iterator]() {
        for (let current = this._head; current !== undefined; current = current.next) {
            yield current.value;
        }
    }
    get destroyed() {
        return this._destroyed;
    }
    get size() {
        return this._size;
    }
    count(filter) {
        let count = 0;
        for (let current = this._head; current !== undefined; current = current.next) {
            if (filter(current.value))
                count += 1;
        }
        return count;
    }
    front() {
        return this._head?.value;
    }
    back() {
        return this._tail?.value;
    }
    destroy() {
        if (this._destroyed)
            return;
        this._destroyed = true;
        for (let current = this._head, next; current !== undefined;) {
            next = current.next;
            current.prev = undefined;
            current.next = undefined;
            current = next;
        }
        this._pool.length = 0;
        this._poolSize = 0;
        this._size = 0;
        this._head = undefined;
        this._tail = undefined;
    }
    init(initialElements) {
        if (this._destroyed) {
            throw new Error('[Deque] `init` is not allowed since it has been destroyed');
        }
        const pool = this._pool;
        let poolSize = this._poolSize;
        for (let current = this._head, next; current !== undefined;) {
            pool[poolSize++] = current;
            next = current.next;
            current.prev = undefined;
            current.next = undefined;
            current = next;
        }
        this._poolSize = poolSize;
        this._size = 0;
        this._head = undefined;
        this._tail = undefined;
        if (initialElements !== undefined)
            this.enqueues(initialElements);
    }
    *consuming() {
        const pool = this._pool;
        let poolSize = this._poolSize;
        while (this._head !== undefined) {
            const node = this._head;
            const next = this._head.next;
            this._head = next;
            if (next === undefined)
                this._tail = undefined;
            this._size -= 1;
            pool[poolSize++] = node;
            node.prev = undefined;
            node.next = undefined;
            if (next !== undefined)
                next.prev = undefined;
            yield node.value;
        }
    }
    dequeue(newElement) {
        if (newElement === undefined) {
            if (this._head === undefined)
                return undefined;
            this._size -= 1;
            const node = this._head;
            const next = node.next;
            this._head = next;
            this._pool[this._poolSize++] = node;
            node.prev = undefined;
            node.next = undefined;
            if (next === undefined)
                this._tail = undefined;
            else
                next.prev = undefined;
            return node.value;
        }
        if (this._head === undefined) {
            let node;
            if (this._poolSize > 0) {
                node = this._pool[--this._poolSize];
                node.value = newElement;
            }
            else {
                node = { value: newElement, prev: undefined, next: undefined };
            }
            this._size = 1;
            this._head = this._tail = node;
            return undefined;
        }
        const result = this._head.value;
        this._head.value = newElement;
        if (this.size > 1) {
            const node = this._head;
            const next = node.next;
            next.prev = undefined;
            node.prev = this._tail;
            node.next = undefined;
            this._tail.next = node;
            this._tail = node;
            this._head = next;
        }
        return result;
    }
    enqueue(element) {
        let node;
        if (this._poolSize > 0) {
            node = this._pool[--this._poolSize];
            node.value = element;
        }
        else {
            node = { value: element, prev: undefined, next: undefined };
        }
        this._size += 1;
        if (this._tail === undefined)
            this._head = this._tail = node;
        else {
            node.prev = this._tail;
            this._tail.next = node;
            this._tail = node;
        }
    }
    enqueues(elements) {
        for (const element of elements)
            this.enqueue(element);
    }
    enqueues_advance(elements, start, end) {
        if (end <= start)
            return;
        for (let i = start; i < end; ++i)
            this.enqueue(elements[i]);
    }
    exclude(filter) {
        if (this._size === 0)
            return 0;
        const pool = this._pool;
        let poolSize = this._poolSize;
        let count = 0;
        let prev;
        let next;
        let last;
        for (let current = this._head; current !== undefined; current = next) {
            next = current.next;
            if (filter(current.value)) {
                if (current === this._head)
                    this._head = next;
                count += 1;
                pool[poolSize++] = current;
                current.prev = undefined;
                current.next = undefined;
                if (next !== undefined)
                    next.prev = prev;
                if (prev !== undefined)
                    prev.next = next;
            }
            else {
                prev = current;
                last = current;
            }
        }
        this._size -= count;
        this._tail = last;
        return count;
    }
    dequeue_back() {
        if (this._tail === undefined)
            return undefined;
        this._size -= 1;
        const node = this._tail;
        const prev = node.prev;
        this._tail = prev;
        this._pool[this._poolSize++] = node;
        node.prev = undefined;
        node.next = undefined;
        if (prev === undefined)
            this._head = undefined;
        else
            prev.next = undefined;
        return node.value;
    }
    enqueue_front(element) {
        let node;
        if (this._poolSize > 0) {
            node = this._pool[--this._poolSize];
            node.value = element;
        }
        else {
            node = { value: element, prev: undefined, next: undefined };
        }
        this._size += 1;
        if (this._head === undefined)
            this._head = this._tail = node;
        else {
            node.next = this._head;
            this._head.prev = node;
            this._head = node;
        }
    }
    enqueues_front(elements) {
        for (const element of elements)
            this.enqueue_front(element);
    }
    enqueues_front_advance(elements, start, end) {
        if (end <= start)
            return;
        for (let i = start; i < end; ++i)
            this.enqueue_front(elements[i]);
    }
}

class PriorityQueue {
    _compare;
    _elements;
    _size;
    _destroyed;
    constructor(props) {
        this._elements = [];
        this._size = 0;
        this._destroyed = false;
        this._compare = props.compare;
    }
    *[Symbol.iterator]() {
        const { _elements, _size } = this;
        for (let i = 0; i < _size; ++i)
            yield _elements[i];
    }
    get destroyed() {
        return this._destroyed;
    }
    get size() {
        return this._size;
    }
    count(filter) {
        const { _elements, _size } = this;
        let count = 0;
        for (let i = 0; i < _size; ++i)
            if (filter(_elements[i]))
                count += 1;
        return count;
    }
    front() {
        return this._size > 0 ? this._elements[0] : undefined;
    }
    destroy() {
        if (this._destroyed)
            return;
        this._destroyed = true;
        this._size = 0;
        this._elements.length = 0;
    }
    init(initialElements) {
        if (this._destroyed) {
            throw new Error('[PriorityQueue] `init` is not allowed since it has been destroyed');
        }
        let size = 0;
        if (initialElements !== undefined) {
            const { _elements } = this;
            for (const element of initialElements) {
                _elements[size] = element;
                size += 1;
            }
        }
        this._size = size;
        this._elements.length = size;
        this._fastBuild();
    }
    *consuming() {
        while (this._size > 0) {
            const target = this._elements[0];
            this._size -= 1;
            if (this._size > 0) {
                this._elements[0] = this._elements[this._size];
                this._downToBottomThenUp(0);
            }
            yield target;
        }
    }
    dequeue(element) {
        if (this._size === 0) {
            if (element !== undefined) {
                this._size = 1;
                this._elements[0] = element;
            }
            return undefined;
        }
        const target = this._elements[0];
        if (element !== undefined) {
            this._elements[0] = element;
            this._downToBottomThenUp(0);
            return target;
        }
        this._size -= 1;
        if (this._size > 0) {
            this._elements[0] = this._elements[this._size];
            this._downToBottomThenUp(0);
        }
        return target;
    }
    enqueue(element) {
        const index = this._size;
        this._elements[index] = element;
        this._size += 1;
        this._up(index);
    }
    enqueues(elements) {
        const _elements = this._elements;
        const size = this._size;
        let nextSize = size;
        for (const element of elements) {
            _elements[nextSize] = element;
            nextSize += 1;
        }
        if (nextSize === size)
            return;
        this._size = nextSize;
        const newAddedCount = nextSize - size;
        if (newAddedCount * Math.log2(nextSize) > nextSize)
            this._fastBuild();
        else
            for (let i = size; i < nextSize; ++i)
                this._up(i);
    }
    enqueues_advance(elements, start, end) {
        if (end <= start)
            return;
        const _elements = this._elements;
        const size = this._size;
        let nextSize = size;
        for (let i = start; i < end; ++i) {
            _elements[nextSize] = elements[i];
            nextSize += 1;
        }
        this._size = nextSize;
        const newAddedCount = end - start;
        if (newAddedCount * Math.log2(nextSize) > nextSize)
            this._fastBuild();
        else
            for (let i = size; i < nextSize; ++i)
                this._up(i);
    }
    exclude(filter) {
        let size = 0;
        const _elements = this._elements;
        for (let i = 0, N = this._size; i < N; ++i) {
            const element = _elements[i];
            if (filter(element))
                continue;
            _elements[size] = element;
            size += 1;
        }
        const removedSize = this._size - size;
        if (removedSize === 0)
            return 0;
        this._size = size;
        _elements.length = size;
        this._fastBuild();
        return removedSize;
    }
    _down(index) {
        const { _elements, _size, _compare } = this;
        if (index < 0 || index >= _size)
            return;
        const item = _elements[index];
        let p = index;
        for (let q = (p << 1) + 1; q < _size; q = (p << 1) + 1) {
            const rht = q + 1;
            if (rht < _size && _compare(_elements[rht], _elements[q]) < 0)
                q = rht;
            const child = _elements[q];
            if (_compare(item, child) <= 0)
                break;
            _elements[p] = child;
            p = q;
        }
        _elements[p] = item;
    }
    _downToBottomThenUp(index) {
        const { _elements, _size, _compare } = this;
        if (index < 0 || index >= _size)
            return;
        const item = _elements[index];
        let p = index;
        let q = (p << 1) + 1;
        while (q + 1 < _size) {
            if (_compare(_elements[q + 1], _elements[q]) < 0)
                q += 1;
            _elements[p] = _elements[q];
            p = q;
            q = (p << 1) + 1;
        }
        if (q < _size) {
            _elements[p] = _elements[q];
            p = q;
        }
        while (p > index) {
            const parent = (p - 1) >> 1;
            const parentElement = _elements[parent];
            if (_compare(parentElement, item) <= 0)
                break;
            _elements[p] = parentElement;
            p = parent;
        }
        _elements[p] = item;
    }
    _up(index) {
        const { _elements, _compare } = this;
        if (index <= 0 || index >= this._size)
            return;
        const item = _elements[index];
        let q = index;
        while (q > 0) {
            const p = (q - 1) >> 1;
            const parent = _elements[p];
            if (_compare(parent, item) <= 0)
                break;
            _elements[q] = parent;
            q = p;
        }
        _elements[q] = item;
    }
    _fastBuild() {
        for (let p = (this._size >> 1) - 1; p >= 0; --p)
            this._down(p);
    }
}

export { CircularQueue, Deque, PriorityQueue };
