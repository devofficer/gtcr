import { gql } from '@apollo/client'

const ITEM_SEARCH_QUERY = gql`
  query itemSearchQuery($text: String!) {
    itemSearch(text: $text, first: $first) {
      id
      itemID
      data
      props {
        type
        value
        isIdentifier
      }
      registry {
        id
      }
    }
  }
`

export default ITEM_SEARCH_QUERY
