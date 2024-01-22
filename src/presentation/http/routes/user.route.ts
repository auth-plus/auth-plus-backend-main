import {
  Request,
  Response,
  NextFunction,
  Router,
  RequestHandler,
} from 'express'
import * as Joi from 'joi'

import { getCore } from '../../../core'

// eslint-disable-next-line import/namespace
const { object, string } = Joi.types()

const userRoute = Router()

interface UserInput {
  name: string
  email: string
  password: string
}
const schema = object.keys({
  name: string.required(),
  email: string.email().required(),
  password: string.required(),
})

userRoute.post('/', (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password }: UserInput = await schema.validateAsync(
      req.body
    )
    const id = await getCore().user.create(name, email, password)
    res.body = { id }
    res.status(201).send({ id })
  } catch (error) {
    next(error)
  }
}) as RequestHandler)

interface UserInfoInput {
  userId: string
  name?: string
  email?: string
  phone?: string
  deviceId?: string
  gaToken?: string
}
const schema2 = object.keys({
  userId: string.required(),
  name: string,
  email: string.email(),
  phone: string,
  deviceId: string,
  gaToken: string,
})

userRoute.patch('/', (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, name, email, phone, deviceId, gaToken }: UserInfoInput =
      await schema2.validateAsync(req.body)
    const resp = await getCore().user.update({
      userId,
      name,
      email,
      phone,
      deviceId,
      gaToken,
    })
    res.body = { result: resp }
    res.status(200).send({ result: resp })
  } catch (error) {
    next(error)
  }
}) as RequestHandler)

userRoute.get('/', (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resp = await getCore().user.list()
    res.body = { result: resp }
    res.status(200).send({ list: resp })
  } catch (error) {
    next(error)
  }
}) as RequestHandler)

export default userRoute
