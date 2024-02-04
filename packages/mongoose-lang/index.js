/* eslint-disable no-void */
/* eslint-disable no-cond-assign */
/* eslint-disable no-prototype-builtins */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable object-shorthand */
import mongoose from 'mongoose'

function has(obj, key) {
  return !!(typeof obj === 'object' && obj.hasOwnProperty(key))
}

function mongooseLang(schema, options) {
  if (
    !options ||
    !options.languages ||
    !Array.isArray(options.languages) ||
    !options.languages.length
  ) {
    throw new mongoose.Error('Required languages array is missing')
  } // plugin options to be set under schema options

  schema.options.mongooseLang = {}
  const pluginOptions = schema.options.mongooseLang
  pluginOptions.languages = options.languages.slice(0) // the first available language will be used as default if it's not set or unknown value passed

  if (!options.defaultLanguage || pluginOptions.languages.indexOf(options.defaultLanguage) === -1) {
    pluginOptions.defaultLanguage =
      pluginOptions === null || pluginOptions === void 0 ? void 0 : pluginOptions.languages[0]
  } else {
    pluginOptions.defaultLanguage = options.defaultLanguage.slice(0)
  }

  pluginOptions.fallback = 'fallback' in options ? options.fallback : false
  schema.eachPath((path, schemaType) => {
    if (schemaType.schema) {
      // propagate plugin initialization for sub-documents schemas
      schemaType.schema.plugin(mongooseLang, pluginOptions)
      return
    }

    if (!schemaType.options.lang) {
      return
    }

    if (!(schemaType instanceof mongoose.Schema.Types.String)) {
      throw new mongoose.Error('Mongoose-lang plugin can be used with String type only')
    }

    const pathArray = path.split('.')
    const key = pathArray.pop()
    let prefix = pathArray.join('.')
    if (prefix) prefix += '.' // removing real path, it will be changed to virtual later

    schema.remove(path) // schema.remove removes path from paths object only, but doesn't update tree
    // sounds like a bug, removing item from the tree manually

    const tree = pathArray.reduce((mem, part) => mem[part], schema.tree)
    delete tree[key]
    schema
      .virtual(path)
      .get(function () {
        // embedded and sub-documents will use language methods from the top level document
        const owner = this.ownerDocument ? this.ownerDocument() : this
        let lang = owner === null || owner === void 0 ? void 0 : owner.getLanguage()
        const langSubDoc = (this.$__getValue || this.getValue).call(this, path)

        if (langSubDoc === null) {
          return langSubDoc
        }

        if (has(langSubDoc, lang)) {
          return langSubDoc[lang]
        } // are there any other languages defined?

        for (lang of pluginOptions.languages) {
          if (has(langSubDoc, lang)) {
            return pluginOptions.fallback ? langSubDoc[lang] : null
          }
        }

        return undefined
      })
      .set(function (value) {
        // multiple languages are set as an object
        if (typeof value === 'object') {
          let _this$schema
          let _this$schema$options
          let _this$schema$options$

          const languages =
            (_this$schema = this.schema) === null || _this$schema === void 0
              ? void 0
              : (_this$schema$options = _this$schema.options) === null ||
                  _this$schema$options === void 0
                ? void 0
                : (_this$schema$options$ = _this$schema$options.mongooseLang) === null ||
                    _this$schema$options$ === void 0
                  ? void 0
                  : _this$schema$options$.languages
          languages.forEach(function (lang) {
            if (!value[lang]) {
              return
            }

            this.set(`${path}.${lang}`, value[lang])
          }, this)
          return
        } // embedded and sub-documents will use language methods from the top level document

        const owner = this.ownerDocument ? this.ownerDocument() : this
        this.set(`${path}.${owner.getLanguage()}`, value)
      }) // lang option is not needed for the current path any more,
    // and is unwanted for all child lang-properties

    delete schemaType.options.lang
    const langObject = {}
    langObject[key] = {}
    pluginOptions.languages.forEach(function (lang) {
      const langOptions = { ...schemaType.options }

      if (lang !== options.defaultLanguage) {
        delete langOptions.default
        delete langOptions.required
      }

      if (schemaType.options.defaultAll) {
        langOptions.default = schemaType.options.defaultAll
      }

      if (schemaType.options.requiredAll) {
        langOptions.required = schemaType.options.requiredAll
      }

      this[lang] = langOptions
    }, langObject[key])
    schema.add(langObject, prefix)
  }) // document methods to set the language for each model instance (document)

  schema.method({
    getFieldByLanguage: function (path, lang) {
      const langSubDoc = (this.$__getValue || this.getValue).call(this, path)

      if (langSubDoc === null) {
        return langSubDoc
      }

      if (has(langSubDoc, lang)) {
        return langSubDoc[lang]
      } // are there any other languages defined?

      for (lang of pluginOptions.languages) {
        if (has(langSubDoc, lang)) {
          return pluginOptions.fallback ? langSubDoc[lang] : null
        }
      }

      return undefined
    },
    spreadLanguageField: function (path) {
      const langSubDoc = (this.$__getValue || this.getValue).call(this, path)

      if (langSubDoc === null) {
        return langSubDoc
      }

      const languages = this.getLanguages()
      const fieldEachLanguage = languages.reduce(
        (dataByLang, lang) => ({ ...dataByLang, [lang]: langSubDoc[lang] }),
        {},
      )
      return fieldEachLanguage
    },
    getLanguages: function () {
      return this.schema.options.mongooseLang.languages
    },
    getLanguage: function () {
      return this.docLanguage || this.schema.options.mongooseLang.defaultLanguage
    },
    setLanguage: function (lang) {
      if (lang && this.getLanguages().indexOf(lang) !== -1) {
        this.docLanguage = lang
      }
    },
    unsetLanguage: function () {
      delete this.docLanguage
    },
  }) // model methods to set the language for the current schema

  schema.static({
    getLanguages: function () {
      return this.schema.options.mongooseLang.languages
    },
    getDefaultLanguage: function () {
      return this.schema.options.mongooseLang.defaultLanguage
    },

    setLanguage(docs, lang) {
      return docs === null || docs === void 0
        ? void 0
        : docs.map((doc) => {
            doc === null || doc === void 0 ? void 0 : doc.setLanguage(lang)
            return doc
          })
    },
  })
}

export default mongooseLang
