import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import Factory from 'factory-girl'
import sinonChai from 'sinon-chai'

const { factory, MongooseAdapter } = Factory
factory.setAdapter(new MongooseAdapter())

chai.use(sinonChai)
chai.use(chaiAsPromised)
chai.should()
