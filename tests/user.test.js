import 'cross-fetch/polyfill'
import { gql } from 'apollo-boost'
import prisma from '../src/prisma'
import seedDatabase, { userOne } from './utils/seedDatabase'
import getClient from './utils/getClient'
import { login, createUser, getUsers, getProfile } from './utils/operations'

const client = getClient()

beforeEach(seedDatabase)

test('should create a new user', async () => {
    const variables = {
        data: {
            name: "John",
            email: "test@test1.com",
            password: "12345678"
        }
    }
    const response = await client.mutate({
        mutation: createUser,
        variables: variables
    })

    const exists = await prisma.exists.User({ id: response.data.createUser.user.id })
    expect(exists).toBe(true)
})

test('Should expose public author profiles', async () => {
    const response = await client.query({ query: getUsers })

    expect(response.data.users.length).toBe(1)
    expect(response.data.users[0].email).toBe(null)
    expect(response.data.users[0].name).toBe("John")
})

test('Should not login with bad credentials', async () => {
    const variables = {
        data: {
            email: "jen@example.com",
            password: "1234"
        }
    }
    await expect(client.mutate({ 
        mutation: login,
        variables: variables
     })).rejects.toThrow()
})

test('should create a new user with invalid passowrd', async () => {

    const variables = {
        data: {
            password: "1234",
            name: "John",
            email: "tt@email.com"
        }
    }

    await expect(client.mutate({ 
        mutation: createUser,
        variables: variables
     })).rejects.toThrow()
})

test('Should fetch user profile', async () => {
    const client = getClient(userOne.jwt)

    const { data } = await client.query({ query: getProfile })

    expect(data.me.id).toBe(userOne.user.id)
})

test('Should fetch user posts', async () => {
    const client = getClient(userOne.jwt)
    const getPosts = gql`
        query {
            myPosts{
                id
                title
                body
                published
            }
        }
    `
    const { data } = await client.query({ query: getPosts })
    expect(data.myPosts.length).toBe(2)
})