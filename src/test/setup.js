// import chai from 'chai'
// import chaiAsPromised from 'chai-as-promised'
// import Factory from 'factory-girl'
// import sinonChai from 'sinon-chai'
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const Factory = require('factory-girl')
const sinonChai = require('sinon-chai')

const { factory, MongooseAdapter } = Factory
factory.setAdapter(new MongooseAdapter())

chai.use(sinonChai)
chai.use(chaiAsPromised)
chai.should()
