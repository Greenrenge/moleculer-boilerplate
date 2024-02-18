import { factory } from 'factory-girl'
import { Department } from '@org/models/department'

factory.define('department', Department, {
	name: factory.chance('name'),
	orgId: factory.chance('string'),
})
