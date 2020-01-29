import React, { useState, useCallback } from 'react'
import {
  Spin,
  Modal,
  Button,
  Typography,
  Descriptions,
  List,
  Radio
} from 'antd'
import styled from 'styled-components/macro'
import PropTypes from 'prop-types'
import ETHAmount from '../../../components/eth-amount.js'

const StyledSpin = styled(Spin)`
  height: 60px;
  width: 100%;
  align-items: center;
  justify-content: center;
  display: flex;
`

const StyledRadioGroup = styled(Radio.Group)`
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
`

const StyledRadio = styled(Radio)`
  display: flex;
  justify-content: space-between;
  align-items: center;

  & > span + span {
    flex: 1;
  }
`

const StyledListItem = styled(List.Item)`
  margin-left: 16px;
`

const AddBadgeModal = ({
  onCancel,
  availableBadges,
  visible,
  tcrAddress,
  connectedTCRAddr,
  onSelectBadge,
  onEnableNewBadge,
  isFetchingBadges
}) => {
  const [selectedBadge, setSelectedBadge] = useState()
  const handleSubmit = useCallback(() => {
    onSelectBadge(availableBadges[selectedBadge])
    onCancel()
  }, [availableBadges, onCancel, onSelectBadge, selectedBadge])

  const handleEnableNewBadge = useCallback(() => {
    onCancel()
    onEnableNewBadge()
  }, [onCancel, onEnableNewBadge])

  if (!availableBadges || !tcrAddress || !connectedTCRAddr || isFetchingBadges)
    return (
      <Modal
        title="Add Badge"
        visible={visible}
        footer={[
          <Button key="back" onClick={onCancel}>
            Cancel
          </Button>
        ]}
        onCancel={onCancel}
      >
        <StyledSpin />
      </Modal>
    )

  return (
    <Modal
      title="Add Badge"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="add-badge"
          type="primary"
          onClick={handleSubmit}
          disabled={typeof selectedBadge === 'undefined'}
        >
          Add Badge
        </Button>
      ]}
    >
      <StyledRadioGroup
        onChange={e => setSelectedBadge(e.target.value)}
        value={selectedBadge}
      >
        {availableBadges.map(
          ({ fileURI, metadata: { tcrTitle, logoURI } }, i) => (
            <StyledRadio value={i} key={i}>
              <StyledListItem
                extra={
                  <img
                    width={50}
                    alt="logo"
                    src={`${process.env.REACT_APP_IPFS_GATEWAY}${logoURI}`}
                  />
                }
              >
                <List.Item.Meta
                  title={tcrTitle}
                  description={
                    <>
                      See the&nbsp;
                      <a
                        href={`${process.env.REACT_APP_IPFS_GATEWAY}${fileURI ||
                          ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'underline' }}
                      >
                        Listing Criteria
                      </a>
                    </>
                  }
                />
              </StyledListItem>
            </StyledRadio>
          )
        )}
        {availableBadges.length === 0 && (
          <div>No badges available for this TCR</div>
        )}
      </StyledRadioGroup>
      <div style={{ margin: '12px 0' }}>
        <Button
          type="link"
          onClick={handleEnableNewBadge}
          style={{ padding: 0 }}
        >
          Enable a new badge
        </Button>
      </div>
      {availableBadges.length > 0 && (
        <>
          <Typography.Paragraph>
            A deposit is required to submit. This value reimbursed at the end of
            the challenge period or, if there is a dispute, be awarded to the
            party that wins.
          </Typography.Paragraph>
          <Descriptions
            bordered
            column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
            style={{ marginBottom: '16px' }}
          >
            <Descriptions.Item label="Total Deposit Required">
              <ETHAmount
                decimals={3}
                amount={
                  typeof selectedBadge !== 'undefined'
                    ? availableBadges[
                        selectedBadge
                      ].submissionDeposit.toString()
                    : 0
                }
                displayUnit
              />
            </Descriptions.Item>
          </Descriptions>
        </>
      )}
    </Modal>
  )
}

AddBadgeModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  availableBadges: PropTypes.arrayOf(PropTypes.any),
  visible: PropTypes.bool,
  tcrAddress: PropTypes.string,
  connectedTCRAddr: PropTypes.string,
  onSelectBadge: PropTypes.func.isRequired,
  onEnableNewBadge: PropTypes.func.isRequired,
  isFetchingBadges: PropTypes.bool
}

AddBadgeModal.defaultProps = {
  availableBadges: null,
  visible: null,
  tcrAddress: null,
  connectedTCRAddr: null,
  isFetchingBadges: null
}

export default AddBadgeModal