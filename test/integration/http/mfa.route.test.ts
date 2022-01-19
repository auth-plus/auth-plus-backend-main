import { expect } from 'chai'
import faker from 'faker'
import request from 'supertest'

import database from '../../../src/core/config/database'
import { Strategy } from '../../../src/core/entities/strategy'
import server from '../../../src/presentation/http/server'

describe('MFA Route', () => {
  const name = faker.datatype.string()
  const email = faker.internet.email()
  let user_id: string
  before(async () => {
    const rowU: Array<{ id: string }> = await database('user')
      .insert({
        name,
        email,
        password_hash:
          '$2b$12$N5NbVrKwQYjDl6xFdqdYdunBnlbl1oyI32Uo5oIbpkaXoeG6fF1Ji',
      })
      .returning('id')
    user_id = rowU[0].id
  })
  after(async () => {
    await database('user').where('id', user_id).del()
  })
  it('should succeed when creating', async () => {
    const response = await request(server).post('/mfa').send({
      name: 'default_email',
      userId: user_id,
      strategy: 'EMAIL',
    })
    const result = await database('multi_factor_authentication')
      .select('*')
      .where('id', response.body.mfaId)
    expect(response.status).to.be.equal(200)
    expect(response.body.mfaId).to.be.equal(result[0].id)
    expect(result[0].is_enable).to.be.equal(false)
    await database('multi_factor_authentication')
      .where('id', response.body.mfaId)
      .del()
  })
  it('should succeed when validate', async () => {
    const row: Array<{ id: string }> = await database(
      'multi_factor_authentication'
    )
      .insert({
        user_id,
        strategy: Strategy.EMAIL,
      })
      .returning('id')
    const mfaId = row[0].id
    const response = await request(server)
      .post('/mfa/validate')
      .send({ id: mfaId })
    const result = await database('multi_factor_authentication')
      .select('*')
      .where('id', mfaId)
    expect(response.status).to.be.equal(200)
    expect(response.body.resp).to.be.equal(true)
    expect(result[0].is_enable).to.be.equal(true)
    await database('multi_factor_authentication').where('id', mfaId).del()
  })
})
