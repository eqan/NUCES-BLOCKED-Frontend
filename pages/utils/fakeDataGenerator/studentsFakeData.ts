import { faker } from '@faker-js/faker'

function generateRollNo() {
    const year = new Date().getFullYear().toString().slice(-2) // get the last two digits of the current year
    const prefix = 'F' // or any other prefix you want to use
    const randomChars = faker.random.alphaNumeric(4) // generate a random string of 4 alphanumeric characters
    return year + prefix + randomChars
}

export const STUDENTS = []

export function createRandomStudent() {
    return {
        name: faker.internet.userName(),
        rollno: generateRollNo(),
        cgpa: faker.datatype.float({ min: 2.0, max: 4.0, precision: 0.01 }),
        email: faker.internet.email(),
    }
}

export function returnArrayOfRandomStudents() {
    return Array.from({ length: 50 }).forEach(() => {
        STUDENTS.push(createRandomStudent())
    })
}
