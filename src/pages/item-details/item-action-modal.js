import React from 'react'
import { Modal } from 'antd'
import { STATUS_CODE, getActionLabel } from '../../utils/item-status'
import RemoveItemModal from './modals/remove-item.js'
import ChallengeRequestModal from './modals/challenge-request.js'
import SubmissionModal from './modals/submission-modal'
import CrowdfundModal from './modals/crowdfund'

const ItemActionModal = ({
  statusCode,
  isOpen,
  itemName,
  onClose,
  fileURI,
  item
}) => {
  // Common button properties.
  const rest = {
    visible: isOpen,
    title: getActionLabel({ statusCode, itemName }),
    onCancel: onClose
  }

  switch (statusCode) {
    case STATUS_CODE.REGISTERED: {
      return (
        <RemoveItemModal
          item={item}
          itemName={itemName}
          fileURI={fileURI}
          {...rest}
        />
      )
    }
    case STATUS_CODE.REJECTED:
      return <SubmissionModal initialValues={item.decodedData} {...rest} />
    case STATUS_CODE.REMOVAL_REQUESTED:
    case STATUS_CODE.SUBMITTED:
      return (
        <ChallengeRequestModal
          item={item}
          itemName={itemName}
          fileURI={fileURI}
          statusCode={statusCode}
          {...rest}
        />
      )
    case STATUS_CODE.CROWDFUNDING:
      return <CrowdfundModal statusCode={statusCode} item={item} {...rest} />
    case STATUS_CODE.CROWDFUNDING_WINNER:
      return <Modal {...rest}>Crowdfund winner</Modal>
    case STATUS_CODE.WAITING_ARBITRATOR:
    case STATUS_CODE.WAITING_ENFORCEMENT:
      return null
    default:
      throw new Error(`Unhandled status code ${statusCode}`)
  }
}

export default ItemActionModal