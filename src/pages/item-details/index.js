import { Layout, Typography } from 'antd'
import React, { useState, useEffect, useContext, useCallback } from 'react'
import PropTypes from 'prop-types'
import ErrorPage from '../error-page'
import styled from 'styled-components/macro'
import ItemDetailsCard from '../../components/item-details-card'
import ItemStatusCard from './item-status-card'
import CrowdfundingCard from './crowdfunding-card'
import { useWeb3Context } from 'web3-react'
import { TCRViewContext } from '../../bootstrap/tcr-view-context'
import { bigNumberify } from 'ethers/utils'
import { gtcrDecode } from '../../utils/encoder'
import RequestTimelines from './request-timelines'
import { WalletContext } from '../../bootstrap/wallet-context'

const StyledLayoutContent = styled(Layout.Content)`
  padding: 42px 9.375vw 42px;
  display: flex;
  flex-direction: column;
`

const StyledBanner = styled.div`
  padding: 24px 9.375vw;
  background: linear-gradient(270deg, #f2e3ff 22.92%, #ffffff 76.25%);
  box-shadow: 0px 3px 24px #bc9cff;
  color: #4d00b4;
`

// TODO: Ensure we don't set state for unmounted components using
// flags and AbortController.
//
// Reference:
// https://itnext.io/how-to-create-react-custom-hooks-for-data-fetching-with-useeffect-74c5dc47000a
// TODO: Ensure http requests are being sent in parallel.
const ItemDetails = ({ itemID, tcrAddress }) => {
  const { library } = useWeb3Context()
  const [errored, setErrored] = useState()
  const { archon } = useContext(WalletContext)
  const [decodedItem, setDecodedItem] = useState()
  const [item, setItem] = useState()
  const [requests, setRequests] = useState()
  const [timestamp, setTimestamp] = useState()
  const [metaEvidence, setMetaEvidence] = useState()
  const { gtcr, tcrErrored, gtcrView, metaEvidencePaths } = useContext(
    TCRViewContext
  )

  // Warning: This function should only be called when all its dependencies
  // are set.
  const fetchItem = useCallback(async () => {
    try {
      const result = {
        ...(await gtcrView.getItem(tcrAddress, itemID))
      } // Spread to convert from array to object.
      setItem(result)
    } catch (err) {
      console.error(err)
      setErrored(true)
    }
  }, [gtcrView, itemID, tcrAddress])

  // Get requests data
  useEffect(() => {
    ;(async () => {
      try {
        if (!gtcrView || !tcrAddress || !itemID) return
        setRequests(await gtcrView.getItemRequests(tcrAddress, itemID))
      } catch (err) {
        console.error('Error fetching item requests', err)
      }
    })()
  }, [gtcrView, itemID, tcrAddress])

  // Decode item bytes once we have it and the meta evidence.
  useEffect(() => {
    if (!item || !metaEvidence || !metaEvidence.columns) return
    const { columns } = metaEvidence
    try {
      setDecodedItem({
        ...item,
        decodedData: gtcrDecode({ columns, values: item.data })
      })
    } catch (err) {
      console.error(err)
      setErrored(true)
    }
  }, [item, metaEvidence])

  // Fetch item and timestamp.
  // This runs when the user loads the details view for the of an item
  // or when he navigates from the details view of an item to
  // the details view of another item (i.e. when itemID changes).
  useEffect(() => {
    if (!gtcrView || !itemID || !library || !tcrAddress) return
    fetchItem()
    try {
      ;(async () => {
        setTimestamp(bigNumberify((await library.getBlock()).timestamp))
      })()
    } catch (err) {
      console.error(err)
      setErrored(true)
    }
  }, [gtcrView, fetchItem, itemID, library, tcrAddress])

  // If the item has a pending request, fetch the meta evidence file for
  // that request.
  useEffect(() => {
    if (!item || !requests || !gtcr || !archon) return
    const latestRequest = requests[requests.length - 1]
    if (metaEvidencePaths.length - 1 < latestRequest.metaEvidenceID.toNumber())
      return

    const metaEvidencePath =
      metaEvidencePaths[latestRequest.metaEvidenceID.toNumber()]
    try {
      ;(async () => {
        const evidenceJSON = await (await fetch(
          `${process.env.REACT_APP_IPFS_GATEWAY}${metaEvidencePath}`
        )).json()
        setMetaEvidence(evidenceJSON)
      })()
    } catch (err) {
      console.error(err)
      setErrored(true)
    }
  }, [archon, gtcr, item, metaEvidencePaths, requests])

  // TODO: Setup and teardown event listeners.

  if (!tcrAddress || !itemID || errored || tcrErrored)
    return (
      <ErrorPage
        code="400"
        message="This item could not be found."
        tip="Is your wallet set to the correct network?"
      />
    )

  return (
    <>
      <StyledBanner>
        <Typography.Title ellipsis style={{ marginBottom: '0' }}>
          {metaEvidence && metaEvidence.itemName} Details
        </Typography.Title>
      </StyledBanner>
      <StyledLayoutContent>
        <ItemStatusCard item={decodedItem || item} timestamp={timestamp} dark />
        <br />
        {/* Crowdfunding card is only rendered if the item has an appealable dispute. */}
        <CrowdfundingCard item={decodedItem || item} timestamp={timestamp} />
        <br />
        <ItemDetailsCard
          title={`${(metaEvidence && metaEvidence.itemName) || 'Item'} Details`}
          columns={metaEvidence && metaEvidence.columns}
          loading={!metaEvidence || !decodedItem || !decodedItem.decodedData}
          item={decodedItem}
        />

        {/* Spread the `requests` parameter to convert elements from array to an object */}
        <RequestTimelines
          item={item}
          requests={requests && requests.map(r => ({ ...r }))}
        />
      </StyledLayoutContent>
    </>
  )
}

ItemDetails.propTypes = {
  tcrAddress: PropTypes.string.isRequired,
  itemID: PropTypes.string.isRequired
}

export default ItemDetails
