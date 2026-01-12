let SVGAnimatedString = function () {}
if (typeof window !== 'undefined') {
	SVGAnimatedString = window.SVGAnimatedString
}

export function convertToArray(value) {
	if (typeof value === 'string') {
		value = value.split(' ')
	}
	return value
}

/**
 * Add classes to an element.
 * This method checks to ensure that the classes don't already exist before adding them.
 * It uses el.className rather than classList in order to be IE friendly.
 * @param {object} el - The element to add the classes to.
 * @param {classes} string - List of space separated classes to be added to the element.
 */
export function addClasses(el, classes) {
	const newClasses = convertToArray(classes)
	let classList
	if (el.className instanceof SVGAnimatedString) {
		classList = convertToArray(el.className.baseVal)
	} else {
		classList = convertToArray(el.className)
	}
	newClasses.forEach((newClass) => {
		if (classList.indexOf(newClass) === -1) {
			classList.push(newClass)
		}
	})
	if (el instanceof SVGElement) {
		el.setAttribute('class', classList.join(' '))
	} else {
		el.className = classList.join(' ')
	}
}

/**
 * Remove classes from an element.
 * It uses el.className rather than classList in order to be IE friendly.
 * @export
 * @param {any} el The element to remove the classes from.
 * @param {any} classes List of space separated classes to be removed from the element.
 */
export function removeClasses(el, classes) {
	const newClasses = convertToArray(classes)
	let classList
	if (el.className instanceof SVGAnimatedString) {
		classList = convertToArray(el.className.baseVal)
	} else {
		classList = convertToArray(el.className)
	}
	newClasses.forEach((newClass) => {
		const index = classList.indexOf(newClass)
		if (index !== -1) {
			classList.splice(index, 1)
		}
	})
	if (el instanceof SVGElement) {
		el.setAttribute('class', classList.join(' '))
	} else {
		el.className = classList.join(' ')
	}
}

export let supportsPassive = false

if (typeof window !== 'undefined') {
	supportsPassive = false
	try {
		const opts = Object.defineProperty({}, 'passive', {
			get() {
				supportsPassive = true
			},
		})
		window.addEventListener('test', null, opts)
	} catch (e) {}
}

export function isEqual(value, other) {
	// Handle same reference or both NaN
	if (value === other) return true
	if (value !== value && other !== other) return true // Both NaN

	// Handle null/undefined cases
	if (value == null || other == null) return value === other

	// Get types
	const valueType = typeof value
	const otherType = typeof other

	// Different types can't be equal
	if (valueType !== otherType) return false

	// Handle primitives (already checked === above, so if we're here they're different)
	if (valueType !== 'object') return false

	// Handle Date objects
	if (value instanceof Date && other instanceof Date) {
		return value.getTime() === other.getTime()
	}

	// Handle RegExp objects
	if (value instanceof RegExp && other instanceof RegExp) {
		return value.toString() === other.toString()
	}

	// Handle Arrays
	const valueIsArray = Array.isArray(value)
	const otherIsArray = Array.isArray(other)

	if (valueIsArray !== otherIsArray) return false

	if (valueIsArray) {
		if (value.length !== other.length) return false

		for (let i = 0; i < value.length; i++) {
			if (!isEqual(value[i], other[i])) return false
		}

		return true
	}

	// Handle Buffer (Node.js)
	if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value) && Buffer.isBuffer(other)) {
		if (value.length !== other.length) return false
		for (let i = 0; i < value.length; i++) {
			if (value[i] !== other[i]) return false
		}
		return true
	}

	// Handle ArrayBuffer and TypedArrays
	if (value instanceof ArrayBuffer && other instanceof ArrayBuffer) {
		return isEqual(new Uint8Array(value), new Uint8Array(other))
	}

	if (ArrayBuffer.isView(value) && ArrayBuffer.isView(other)) {
		if (value.byteLength !== other.byteLength) return false
		for (let i = 0; i < value.byteLength; i++) {
			if (value[i] !== other[i]) return false
		}
		return true
	}

	// Handle Map objects
	if (value instanceof Map && other instanceof Map) {
		if (value.size !== other.size) return false

		for (const [key, val] of value) {
			if (!other.has(key) || !isEqual(val, other.get(key))) {
				return false
			}
		}

		return true
	}

	// Handle Set objects
	if (value instanceof Set && other instanceof Set) {
		if (value.size !== other.size) return false

		for (const val of value) {
			let found = false
			for (const otherVal of other) {
				if (isEqual(val, otherVal)) {
					found = true
					break
				}
			}
			if (!found) return false
		}

		return true
	}

	// Handle plain objects
	const valueKeys = Object.keys(value)
	const otherKeys = Object.keys(other)

	if (valueKeys.length !== otherKeys.length) return false

	// Check if all keys exist and values are equal
	for (const key of valueKeys) {
		if (!Object.prototype.hasOwnProperty.call(other, key)) return false
		if (!isEqual(value[key], other[key])) return false
	}

	return true
}
