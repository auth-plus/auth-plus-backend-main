import { expect } from 'chai'
import faker from 'faker'
import { mock, instance, when, verify, anything } from 'ts-mockito'

import { Strategy } from '../../../src/core/entities/strategy'
import { EmailRepository } from '../../../src/core/providers/email.repository'
import { MFAChooseRepository } from '../../../src/core/providers/mfa_choose.repository'
import { MFACodeRepository } from '../../../src/core/providers/mfa_code.repository'
import {
  CreatingMFACode,
  CreatingMFACodeErrors,
  CreatingMFACodeErrorsTypes,
} from '../../../src/core/usecases/driven/creating_mfa_code.driven'
import {
  FindingMFAChoose,
  FindingMFAChooseErrors,
  FindingMFAChooseErrorsTypes,
} from '../../../src/core/usecases/driven/finding_mfa_choose.driven'
import {
  NotificationErrorsTypes,
  Notification,
  NotificationErrors,
} from '../../../src/core/usecases/driven/sending_mfa_code.driven'
import { ChooseMFAErrorsTypes } from '../../../src/core/usecases/driver/choose_mfa.driver'
import MFAChoose from '../../../src/core/usecases/mfa_choose.usecase'

describe('mfa choose usecase', function () {
  const hash = faker.datatype.uuid()
  const newHash = faker.datatype.uuid()
  const userId = faker.datatype.uuid()
  const code = faker.datatype.number(6).toString()
  const strategyList = [Strategy.EMAIL]
  it('should succeed choosing mfa', async () => {
    const mockFindingMFAChoose: FindingMFAChoose = mock(MFAChooseRepository)
    when(mockFindingMFAChoose.findByHash(hash)).thenResolve({
      userId,
      strategyList,
    })
    const findingMFAChoose: FindingMFAChoose = instance(mockFindingMFAChoose)

    const mockCreatingMFACode: CreatingMFACode = mock(MFACodeRepository)
    when(
      mockCreatingMFACode.creatingCodeForStrategy(userId, Strategy.EMAIL)
    ).thenResolve({ hash: newHash, code })
    const creatingMFACode: CreatingMFACode = instance(mockCreatingMFACode)

    const mockNotification: Notification = mock(EmailRepository)
    when(mockNotification.sendCodeForUser(userId, newHash)).thenResolve()
    const notification: Notification = instance(mockNotification)

    const testClass = new MFAChoose(
      findingMFAChoose,
      creatingMFACode,
      notification
    )
    const response = await testClass.choose(hash, Strategy.EMAIL)

    verify(mockFindingMFAChoose.findByHash(hash)).once()
    verify(
      mockCreatingMFACode.creatingCodeForStrategy(userId, Strategy.EMAIL)
    ).once()
    verify(mockNotification.sendCodeForUser(userId, newHash)).once()
    expect(response).to.eql(newHash)
  })

  it('should fail choosing mfa when not finding strategy', async () => {
    const mockFindingMFAChoose: FindingMFAChoose = mock(MFAChooseRepository)
    when(mockFindingMFAChoose.findByHash(hash)).thenResolve({
      userId,
      strategyList,
    })
    const findingMFAChoose: FindingMFAChoose = instance(mockFindingMFAChoose)

    const mockCreatingMFACode: CreatingMFACode = mock(MFACodeRepository)
    const creatingMFACode: CreatingMFACode = instance(mockCreatingMFACode)

    const mockNotification: Notification = mock(EmailRepository)
    const Notification: Notification = instance(mockNotification)

    const testClass = new MFAChoose(
      findingMFAChoose,
      creatingMFACode,
      Notification
    )
    try {
      await testClass.choose(hash, Strategy.PHONE)
    } catch (error) {
      expect((error as Error).message).to.eql(
        ChooseMFAErrorsTypes.STRATEGY_NOT_LISTED
      )
    }

    verify(mockFindingMFAChoose.findByHash(hash)).once()
    verify(
      mockCreatingMFACode.creatingCodeForStrategy(anything(), anything())
    ).never()
    verify(mockNotification.sendCodeForUser(anything(), anything())).never()
  })

  it('should fail choosing mfa when finding hash', async () => {
    const mockFindingMFAChoose: FindingMFAChoose = mock(MFAChooseRepository)
    when(mockFindingMFAChoose.findByHash(hash)).thenReject(
      new FindingMFAChooseErrors(FindingMFAChooseErrorsTypes.NOT_FOUND)
    )
    const findingMFAChoose: FindingMFAChoose = instance(mockFindingMFAChoose)

    const mockCreatingMFACode: CreatingMFACode = mock(MFACodeRepository)
    const creatingMFACode: CreatingMFACode = instance(mockCreatingMFACode)

    const mockNotification: Notification = mock(EmailRepository)
    const Notification: Notification = instance(mockNotification)

    const testClass = new MFAChoose(
      findingMFAChoose,
      creatingMFACode,
      Notification
    )
    try {
      await testClass.choose(hash, Strategy.EMAIL)
    } catch (error) {
      expect((error as Error).message).to.eql(ChooseMFAErrorsTypes.NOT_FOUND)
    }

    verify(mockFindingMFAChoose.findByHash(hash)).once()
    verify(
      mockCreatingMFACode.creatingCodeForStrategy(anything(), anything())
    ).never()
    verify(mockNotification.sendCodeForUser(anything(), anything())).never()
  })

  it('should fail choosing mfa when finding hash having cache error', async () => {
    const mockFindingMFAChoose: FindingMFAChoose = mock(MFAChooseRepository)
    when(mockFindingMFAChoose.findByHash(hash)).thenReject(
      new FindingMFAChooseErrors(
        FindingMFAChooseErrorsTypes.CACHE_DEPENDECY_ERROR
      )
    )
    const findingMFAChoose: FindingMFAChoose = instance(mockFindingMFAChoose)

    const mockCreatingMFACode: CreatingMFACode = mock(MFACodeRepository)
    const creatingMFACode: CreatingMFACode = instance(mockCreatingMFACode)

    const mockNotification: Notification = mock(EmailRepository)
    const Notification: Notification = instance(mockNotification)

    const testClass = new MFAChoose(
      findingMFAChoose,
      creatingMFACode,
      Notification
    )
    try {
      await testClass.choose(hash, Strategy.EMAIL)
    } catch (error) {
      expect((error as Error).message).to.eql(
        ChooseMFAErrorsTypes.DEPENDECY_ERROR
      )
    }

    verify(mockFindingMFAChoose.findByHash(hash)).once()
    verify(
      mockCreatingMFACode.creatingCodeForStrategy(anything(), anything())
    ).never()
    verify(mockNotification.sendCodeForUser(anything(), anything())).never()
  })

  it('should fail choosing mfa when creating code', async () => {
    const mockFindingMFAChoose: FindingMFAChoose = mock(MFAChooseRepository)
    when(mockFindingMFAChoose.findByHash(hash)).thenResolve({
      userId,
      strategyList,
    })
    const findingMFAChoose: FindingMFAChoose = instance(mockFindingMFAChoose)

    const mockCreatingMFACode: CreatingMFACode = mock(MFACodeRepository)
    when(
      mockCreatingMFACode.creatingCodeForStrategy(userId, Strategy.EMAIL)
    ).thenReject(
      new CreatingMFACodeErrors(
        CreatingMFACodeErrorsTypes.CACHE_DEPENDECY_ERROR
      )
    )
    const creatingMFACode: CreatingMFACode = instance(mockCreatingMFACode)

    const mockNotification: Notification = mock(EmailRepository)
    const Notification: Notification = instance(mockNotification)

    const testClass = new MFAChoose(
      findingMFAChoose,
      creatingMFACode,
      Notification
    )
    try {
      await testClass.choose(hash, Strategy.EMAIL)
    } catch (error) {
      expect((error as Error).message).to.eql(
        ChooseMFAErrorsTypes.DEPENDECY_ERROR
      )
    }

    verify(mockFindingMFAChoose.findByHash(hash)).once()
    verify(
      mockCreatingMFACode.creatingCodeForStrategy(userId, Strategy.EMAIL)
    ).once()
    verify(mockNotification.sendCodeForUser(anything(), anything())).never()
  })

  it('should fail choosing mfa when sending code for not finding user', async () => {
    const mockFindingMFAChoose: FindingMFAChoose = mock(MFAChooseRepository)
    when(mockFindingMFAChoose.findByHash(hash)).thenResolve({
      userId,
      strategyList,
    })
    const findingMFAChoose: FindingMFAChoose = instance(mockFindingMFAChoose)

    const mockCreatingMFACode: CreatingMFACode = mock(MFACodeRepository)
    when(
      mockCreatingMFACode.creatingCodeForStrategy(userId, Strategy.EMAIL)
    ).thenResolve({ hash: newHash, code })
    const creatingMFACode: CreatingMFACode = instance(mockCreatingMFACode)

    const mockNotification: Notification = mock(EmailRepository)
    when(mockNotification.sendCodeForUser(userId, newHash)).thenReject(
      new NotificationErrors(NotificationErrorsTypes.PROVIDER_ERROR)
    )
    const Notification: Notification = instance(mockNotification)

    const testClass = new MFAChoose(
      findingMFAChoose,
      creatingMFACode,
      Notification
    )
    try {
      await testClass.choose(hash, Strategy.EMAIL)
    } catch (error) {
      expect((error as Error).message).to.eql(ChooseMFAErrorsTypes.NOT_FOUND)
    }

    verify(mockFindingMFAChoose.findByHash(hash)).once()
    verify(
      mockCreatingMFACode.creatingCodeForStrategy(userId, Strategy.EMAIL)
    ).once()
    verify(mockNotification.sendCodeForUser(userId, newHash)).once()
  })

  it('should fail choosing mfa when sending code', async () => {
    const mockFindingMFAChoose: FindingMFAChoose = mock(MFAChooseRepository)
    when(mockFindingMFAChoose.findByHash(hash)).thenResolve({
      userId,
      strategyList,
    })
    const findingMFAChoose: FindingMFAChoose = instance(mockFindingMFAChoose)

    const mockCreatingMFACode: CreatingMFACode = mock(MFACodeRepository)
    when(
      mockCreatingMFACode.creatingCodeForStrategy(userId, Strategy.EMAIL)
    ).thenResolve({ hash: newHash, code })
    const creatingMFACode: CreatingMFACode = instance(mockCreatingMFACode)

    const mockNotification: Notification = mock(EmailRepository)
    when(mockNotification.sendCodeForUser(userId, newHash)).thenReject(
      new NotificationErrors(NotificationErrorsTypes.PROVIDER_ERROR)
    )
    const Notification: Notification = instance(mockNotification)

    const testClass = new MFAChoose(
      findingMFAChoose,
      creatingMFACode,
      Notification
    )
    try {
      await testClass.choose(hash, Strategy.EMAIL)
    } catch (error) {
      expect((error as Error).message).to.eql(
        ChooseMFAErrorsTypes.DEPENDECY_ERROR
      )
    }

    verify(mockFindingMFAChoose.findByHash(hash)).once()
    verify(
      mockCreatingMFACode.creatingCodeForStrategy(userId, Strategy.EMAIL)
    ).once()
    verify(mockNotification.sendCodeForUser(userId, newHash)).once()
  })
})
