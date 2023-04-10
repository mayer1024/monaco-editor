<template>
  <div ref="el" class="monaco-editor" :style="{ width, height }"></div>
  <!--  <EditorWorker></EditorWorker>-->
</template>

<script lang="ts" setup>
import { onMounted, watch } from 'vue'
import type { PropType } from 'vue'
import { useMonacoEditor } from './index.hook'
// import { EditorWorker } from './index'

const props = defineProps({
  width: {
    type: String as PropType<string>,
    default: '100%'
  },
  height: {
    type: String as PropType<string>,
    default: '90vh'
  },
  language: {
    type: String as PropType<string>,
    default: 'typescript'
  },
  preComment: {
    type: String as PropType<string>,
    default: ''
  },
  modelValue: {
    type: String as PropType<string>,
    default: ''
  },
  editorOptions: {
    type: Object as PropType<object>,
    default: () => ({})
  }
})

const emits = defineEmits(['blur', 'update:modelValue'])

const { el, updateVal, getEditor, createEditor, addSuggestion } = useMonacoEditor(props.language)

const updateMonacoVal = (_val?: string) => {
  const { modelValue, preComment } = props
  const val = preComment ? `${preComment}\n${_val || modelValue}` : _val || modelValue
  updateVal(val)
}

setTimeout(() => {
  console.info('延时执行')
  updateMonacoLanguage()
}, 3000)

const updateMonacoLanguage = () => {
  addSuggestion(['TS_CALC', 'TS_SHIFT', 'GET_OBJ_DATA'])
}

onMounted(() => {
  const monacoEditor = createEditor(props.editorOptions)
  monacoEditor?.onDidChangeModelContent(() => {
    emits('update:modelValue', monacoEditor!.getValue())
  })
  monacoEditor?.onDidBlurEditorText(() => {
    emits('blur')
  })
  updateMonacoVal()
})

watch(
  () => props.modelValue,
  (val: string) => {
    val !== getEditor()?.getValue() && updateMonacoVal(val)
  }
)
</script>

<style lang="css" scoped>
.monaco-editor {
  border-color: var(--el-border-color-base);
  border: var(--el-border);
}
</style>
