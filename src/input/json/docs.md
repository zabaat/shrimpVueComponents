## json(Vue component)

Used in autoform but can be used on its own. Uses https://www.npmjs.com/package/jsoneditor. Here are it's API docs: https://github.com/josdejong/jsoneditor/blob/master/docs/api.md#

If you want to access the jsoneditor instance within this component, call the **getEditor()** function.

#### Usage
```html
<template>
	<div>
		<json
			placeholder="some placeholder"
			:options="options"
			:value="myObj"
			@value="log(myValue)"
		/>

        <!-- OR you can use the v-model property -->
        <json
            placeholder="some placeholder"
			:options="options"
			v-model="myObj"
        />

	</div>
</template>
```

```javascript
import svt from 'shrimp-vue-components'

export default {
	components: { json: svt.input.json },
	data() {
        return {
            myObj: { first: 'Shahan', last: 'Kazi' },
            options:{
			    style: "min-width:50px;",
			    limit: 3 // only 3 files may be selected at once.
            }
        }
	},
	methods: {
		log: console.log
	}
}


```

You can also import like this:
```javascript
import json from 'shrimp-vue-components/src/input/json'
```

### Props
- **validateFn (function)** - Optional validator function. If it returns a string, the component is set to be in error.
- **value (object | array)** - The value passed into the component.
- **placeholder (String)** - The name to display at the root.
- **options (Object)** - Optional options object. 
	- deepCheckOnUpdate (boolean) - **false by default. For performance sake, the json component has a built in uid system that makes it so it doesn't have to check objects super deep. Perform a deep check every time the updateValue function is called or when the value prop changes. You might want this if you change an object using this component, change it elsewhere and then use the same instance of this component. An edge-case for sure but it may happen!**
	- style (string | object) - The style of the object.
	- modes (string[]) - The modes that the user can choose from. Defaults to ['tree', 'form', 'view', 'code' ]
	- mode (string) - One of ['tree', 'form', 'view', 'code' ]
	- onModeChange (function) - Is triggered with (currentMode, oldMode) as the params.
	- onChange (function) - Is triggered with (currentValue) only when the user changes the value
	- onError (function) - Is triggered when the jsonEditor goes into error
	- search (boolean) - Have a search option at the top. Defaults to true.
	- escapeUnicode (boolean) - Escape unicode. True by default.
	- sortObjectKeys (boolean) - Sorts the keys of an object. True by default.
	- history (boolean) - Have undo, redo. True by default.
	- schema (object) - Used in validation. Look at the API link above. null by default.
	- schemaRefs (object) - Look at the API link above. null by default.
	- templates (object[]) - Allows for quick insertion of objects. See API. null by default. 
	- ace (object) - See API
	- ajv (object) - See API
    - menu (boolean) - show menu. True by default.
	

### Events
- **value(object)** - Emitted when the value changes.

### Methods
- **updateValue(object | array, forceBoolean)** - Sets the value of the component programatically. If the second argument is truthy, it will always update the jsonEditor instance (and won't bother checking for equality)
- **getValue()** - Returns the value of the component. **object | array**
- **isInError()** - Returns **true** if **validateFn** returns a string.
- **isEmpty()** - If nothing is selected, this will return **true**.

The following methods are related to the jsonEditor instance:
- **getEditor()** - Returns the jsonEditor instance.
- **collapseAll()** - Collapses all expanded properties in the editor
- **expandAll()** - Expands all properties in the editor
- **focus()** - Gives the jsonEditor instance focus
- **setSchema(object | [object])** - Allows to set schema objects. Look at the API link referenced at the top
