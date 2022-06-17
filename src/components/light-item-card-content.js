import React from 'react'
import styled from 'styled-components/macro'
import PropTypes from 'prop-types'
import DisplaySelector from './display-selector'
import { ItemTypes } from '@kleros/gtcr-encoder'
import { Button } from 'antd'
import { Link } from 'react-router-dom'

const StyledItemCol = styled.div`
  margin-bottom: 8px;
  text-align: center;
`

const StyledButton = styled(Button)`
  pointer-events: auto;
  text-transform: capitalize;
`

const LightItemCardContent = ({ item, chainId, tcrAddress }) => (
  <div
    style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}
  >
    <div>
      {item.mergedData
        .filter(
          col =>
            col.isIdentifier ||
            col.type === ItemTypes.IMAGE ||
            col.type === ItemTypes.FILE ||
            col.type === ItemTypes.TWITTER_USER_ID
        )
        .map((column, j) => (
          <StyledItemCol key={j}>
            <DisplaySelector
              type={column.type}
              value={column.value}
              allowedFileTypes={column.allowedFileTypes}
            />
          </StyledItemCol>
        ))}
    </div>
    <Link to={`/tcr/${chainId}/${tcrAddress}/${item.ID}`}>
      <StyledButton>Details</StyledButton>
    </Link>
  </div>
)

LightItemCardContent.propTypes = {
  item: PropTypes.shape({
    ID: PropTypes.string.isRequired,
    mergedData: PropTypes.arrayOf(
      PropTypes.shape({
        isIdentifier: PropTypes.bool,
        type: PropTypes.oneOf(Object.values(ItemTypes)),
        value: PropTypes.oneOfType([
          PropTypes.bool,
          PropTypes.string,
          PropTypes.number,
          PropTypes.object
        ])
      })
    )
  }).isRequired,
  tcrAddress: PropTypes.string.isRequired
}

export default LightItemCardContent
