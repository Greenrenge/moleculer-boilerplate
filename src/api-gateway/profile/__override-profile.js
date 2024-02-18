export const overrideEmployeeProfile = (employee, user) => ({
	...user,
	...employee,
	firstName: employee.firstName || user.firstName,
	lastName: employee.lastName || user.lastName,
	nickName: employee.nickName || user.nickName,
	image: employee.image || employee.image,
})
