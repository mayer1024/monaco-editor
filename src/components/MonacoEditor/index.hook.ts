// @ts-nocheck
import { ref, onBeforeUnmount, nextTick } from 'vue'
import * as monaco from 'monaco-editor'

export const useMonacoEditor = (language = 'javascript') => {
  addCustomLang()

  let monacoEditor: monaco.editor.IStandaloneCodeEditor | null = null
  let initReadOnly = false
  const el = ref<HTMLElement | null>(null)

  // 格式化
  const onFormatDoc = async () => {
    await monacoEditor?.getAction('monacoEditor.action.formatDocument')?.run()
  }

  // 更新
  const updateVal = (val: string) => {
    nextTick(async () => {
      monacoEditor?.setValue(val)
      initReadOnly && monacoEditor?.updateOptions({ readOnly: false })
      await onFormatDoc()
      initReadOnly && monacoEditor?.updateOptions({ readOnly: true })
    })
  }

  // 创建实例
  const createEditor = (editorOption: monaco.editor.IStandaloneEditorConstructionOptions = {}) => {
    if (!el.value) return
    const javascriptModel = monaco.editor.createModel('', language)
    initReadOnly = !!editorOption.readOnly
    // 创建
    monacoEditor = monaco.editor.create(el.value, {
      model: javascriptModel,
      language: 'ATP',
      theme: 'myTheme',
      wordWrap: 'wordWrapColumn',
      wordWrapColumn: 120,
      wrappingIndent: 'indent'
    })

    return monacoEditor
  }

  // 卸载
  onBeforeUnmount(() => {
    if (monacoEditor) monacoEditor.dispose()
  })

  return {
    el,
    updateVal,
    getEditor: () => monacoEditor,
    createEditor,
    onFormatDoc
  }
}

function addCustomLang() {
  const lang = 'ATP'
  monaco.languages.register({ id: lang })
  monaco.editor.defineTheme('myTheme', {
    colors: {},
    encodedTokensColors: [],
    base: 'vs',
    inherit: true,
    rules: [
      {
        token: 'my-func',
        foreground: 'ff0000',
        fontStyle: 'blod'
      }
    ]
  })

  monaco.languages.setMonarchTokensProvider(lang, {
    tokenizer: {
      root: [
        [/\b0[xX][0-9a-fA-F]+\b/, 'number.hex'],
        [/\b\d+\b/, 'number'],

        [/\b(if|else|return)\b/, 'my-keyword'],

        [/\b(and|or|not)\b/, 'my-built-in-function'],

        [/([a-zA-Z0-9_]+)\s*(\(.*\))/, '@rematch', '@matchfunc'],

        [/'([^'\\]|\\.)*$/, 'string.invalid'],
        [/'/, { token: 'string.quote', bracket: '@open', next: '@string' }],
        { include: '@whitespace' }
      ],
      matchfunc: [[/([a-zA-Z0-9_]+)/, { token: 'my-function', next: '@popall' }]],
      string: [
        [/[^\\'']+/, 'string'],
        [/\\./, 'string.escape.invalid'],
        [/'/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
      ],
      comment: [[/#.*$/, 'comment']],
      whitespace: [
        [/[ \t\r\n]+/, 'white'],
        [/#.*$/, 'comment']
      ]
    },
    //语言大小写不敏感吗
    ignoreCase: true
  })

  monaco.languages.setLanguageConfiguration(lang, {
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')']
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      // { open: '"', close: '"', notIn: ["string"] },
      { open: "'", close: "'", notIn: ['string', 'comment'] }
      // { open: "`", close: "`", notIn: ["string", "comment"] },
      // { open: "/**", close: " */", notIn: ["string"] },
    ]
  })

  monaco.languages.registerCompletionItemProvider(lang, {
    provideCompletionItems: (model, position, context, token) => {
      let suggestions = [
        {
          label: 'SET OBJ_DATA ',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: ['SET ${0:OBJ_DATA} '].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'object-对象|map-MAP对象|selector-筛选条件'
        },
        {
          label: 'TS_ROLLING',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: ['TS_ROLLING '].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail:
            'ts_id-必填，时序对象 \n agg_operator-必填，聚合运算符，为系统定义的固定常量 \n period_start-必填，整数，窗口开始期间，表示为与当前期间的相对值 \n number_of_periods-必填，正整数，以期间个数计的窗口长度 \n start_period-可选，定义计算的开期间 \n end_period-可选，定义计算的结束期间 \n additional_parameter-当agg_operator接收第二参数时，用该值指定'
        },
        {
          label: 'TS_CUMULATE',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: ['TS_CUMULATE '].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail:
            'ts_id-必填，时序对象 \n agg_operator-必填，聚合运算符，为系统定义的固定常量 \n period_start-必填，整数，窗口开始期间，表示为与当前期间的相对值 \n number_of_periods-必填，正整数，以期间个数计的窗口长度 \n start_period-可选，定义计算的开期间 \n end_period-可选，定义计算的结束期间 \n additional_parameter-当agg_operator接收第二参数时，用该值指定'
        },
        {
          label: 'TS_PROPORTION',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: ['TS_PROPORTION '].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail:
            'ts_id-必填，时序对象 \n time_agg_dimension-选填，关键字PERIOD标志的期间类型，用于指定计算汇总值的期间类型 \n attribute_agg_dimension-选填，关键字ATTR标志的属性列表，用于指定计算汇总值的属性维度'
        },
        {
          label: 'SELECTOR',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: ['SELECTOR '].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'expression-用于定义筛选条件，返回基于属性和值之间关系的WHERE语句'
        },
        {
          label: 'SORT',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: ['SORT '].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'sort_attribute-用于定义筛选条件，返回基于属性和值之间关系的WHERE语句'
        },
        {
          label: 'TS_CALC',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: ['TS_CALC '].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'expression-必填，时序四则运算表达式'
        },
        {
          label: 'TS_SHIFT',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: ['TS_SHIFT '].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail:
            'ts_id-必填，时序对象 \n shift_periods_number-必填，整数，表示要移动的期间数，正数则向未来方向移动，负数则向过去方向移动，期间类型为时序ts_id的期间类型'
        },
        {
          label: 'GET_OBJ_DATA',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: ['GET_OBJ_DATA '].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'object-对象 \n attributeList-属性集合 \n selector-筛选条件'
        }
      ]
      return { suggestions: suggestions }
    }
  })

  monaco.languages.registerHoverProvider(lang, {
    provideHover: function (document, position, token) {
      console.log(document.getWordAtPosition(position))
      if (document.getWordAtPosition(position) != null) {
        const word = document.getWordAtPosition(position)?.word
        return {
          contents: [
            { value: '**OBJ_DATA**' },
            {
              value: ['object 对象', 'map MAP对象', 'selector 筛选条件'].join('\n\n')
            }
          ]
        }
      }
    }
  })
}
