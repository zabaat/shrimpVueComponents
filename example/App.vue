<template>
    <div id="q-app" class="row">
        <div class="drawer">
            <div style="overflow-y:auto" class="column items-stretch">
                <toggleButton class="drawer__btn" v-for="example in examples" :key="example" @on="myComponent = example" :isPushed="example === myComponent">
                    {{ example }}
                </toggleButton>
            </div>
        </div>
        <div class="viewport">
            <component :is="myComponent"></component>
        </div>
    </div>
</template>

<script>
import toggleButton from "@/button/toggleButton"
import autoform from './examples/autoform/autoform'
import autoformWithCustomComponents from './examples/autoformWithCustomComponents/autoformCustom'
import fbAdminPanel from "./examples/fbAdminPanel/adminPanel"
import fbAuthentication from "./examples/fbAuthentication/fbAuthentication"
import toast from './examples/toast/toast'
import modal from './examples/modal/modal'
import dialogExample from './examples/dialog/dialogExample'
import animator from './examples/animator/animator'
import fileExample from './examples/file/file'
import adder from './examples/adder/adder'
import jsonEditor from './examples/jsonEditor/jsonEditor'
import virtualList from './examples/virtualList'
import datatable from './examples/datatable'
import combobox from './examples/combobox'

export default {
    name: 'app',
    data() {
        return {
            myComponent: null,
            userIsActive: true,
            examples: ["combobox", "fbAdminPanel", "fbAuthentication", "animator", "toast", "modal", "autoform", "autoformWithCustomComponents", "jsonEditor", "dialogExample", "fileExample", "adder", "virtualList", "datatable"].sort()
        }
    },
    components: {
        combobox,
        toggleButton,
        fbAdminPanel,
        fbAuthentication,
        datatable,
        animator,
        toast,
        modal,
        dialogExample,
        autoform,
        autoformWithCustomComponents,
        fileExample,
        adder,
        jsonEditor,
        virtualList
    },

};
</script>

<style>
#q-app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    width: 100vw;
}


.drawer {
    /* flex: 1 1 10vw; */
    height: 100vh;
    overflow: hidden;
    margin: 0;
    margin-right: 5px;
}

.drawer__btn {
    height: 40px;
}

.viewport {
    flex: 1 1 90vw;
    height: 100vh;
    overflow-y: auto;
}

body {
    margin: 0;
}
</style>
