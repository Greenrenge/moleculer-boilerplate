const { expect } = require('chai')
const mongoose = require('mongoose')
const mongooseLang = require('../index')

const MONGO_URI = 'mongodb://localhost/mongoose_lang_test'

const LANGUAGE_OPTION = {
  languages: ['th', 'en', 'ja'],
  defaultLanguage: 'th',
  fallback: true,
}

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    lang: true,
  },
  userId: String,
  date: Date,
})

BookSchema.plugin(mongooseLang, LANGUAGE_OPTION)

const Book = mongoose.model('Book', BookSchema)

describe('mongoose-lang', () => {
  before((done) => {
    mongoose.connect(
      MONGO_URI,
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      },
      done,
    )
  })

  before((done) => {
    mongoose.connection.db.dropDatabase(done)
  })

  it('should throw error require language when it was not sent languages params', () => {
    const TestSchema = new mongoose.Schema({
      title: {
        type: String,
        lang: true,
      },
      date: Date,
    })
    try {
      TestSchema.plugin(mongooseLang)
    } catch (error) {
      expect(error.message).to.equal('Required languages array is missing')
    }
  })

  it('should throw error when type not string', () => {
    const TestSchema = new mongoose.Schema({
      title: {
        type: Object,
        lang: true,
      },
      date: Date,
    })
    try {
      TestSchema.plugin(mongooseLang, LANGUAGE_OPTION)
    } catch (error) {
      expect(error.message).to.equal('Mongoose-lang plugin can be used with String type only')
    }
  })

  it('should create title for th, en, ja', async () => {
    const result = await Book.create({
      title: {
        th: 'th',
        en: 'en',
        ja: 'ja',
      },
    })
    expect(result.title).to.equal('th')
    result.setLanguage('ja')
    expect(result.title).to.equal('ja')
    result.setLanguage('en')
    expect(result.title).to.equal('en')
  })

  it('should return data follow language', async () => {
    const book = await Book.create({
      title: {
        th: 'ไทย',
        en: 'eng',
        ja: 'japan',
      },
    })
    const result = await Book.findById(book._id)
    expect(result.title).to.equal('ไทย')
    result.setLanguage('ja')
    expect(result.title).to.equal('japan')
    result.setLanguage('en')
    expect(result.title).to.equal('eng')
  })

  it('should return list data follow language', async () => {
    const a = await Book.insertMany([
      {
        title: {
          th: 'th',
          en: 'eng',
          ja: 'japan',
        },
        userId: '1',
      },
      {
        title: {
          th: 'th',
          en: 'eng',
          ja: 'japan',
        },
        userId: '1',
      },
    ])
    const result = await Book.find({ userId: '1' })
    expect(result.length).to.equal(2)
    for (let i = 0; i < result.length; i++) {
      expect(result[i].title).to.equal('th')
    }
    Book.setLanguage(result, 'en')
    for (let i = 0; i < result.length; i++) {
      expect(result[i].title).to.equal('eng')
    }
    Book.setLanguage(result, 'ja')
    for (let i = 0; i < result.length; i++) {
      expect(result[i].title).to.equal('japan')
    }
  })

  after((done) => {
    mongoose.connection.db.dropDatabase(done)
  })

  after((done) => {
    mongoose.disconnect(done)
  })
})
