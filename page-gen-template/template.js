import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'
import { Layout } from '../../components/layout'
import { Seo } from '../../components/seo'
import { Sidebar } from '../../components/sidebar'
import { PostItems } from '../../components/post-items'
import { PageDescription } from '../../components/page-description'
import { PageTitle } from '../../components/page-title'
import { capitalize } from '../../utils/capitalize'
import { useTopLevelPathName } from '../../hooks'

import './index.scss'

const Index = ({ data }) => {
  const topLevelPathName = useTopLevelPathName()
  const pageName = capitalize(topLevelPathName)
  const posts = data.posts.nodes
  const directorys = data.directorys.nodes
  const description = 'DS#####'

  return (
    <Layout belongs={topLevelPathName}>
      <Seo title={pageName} />
      <Sidebar directorys={directorys} currentCatName={topLevelPathName} />
      <PageTitle title={pageName} />
      <PageDescription description={description} />
      <PostItems posts={posts} />
    </Layout>
  )
}

Index.propTypes = {
  data: PropTypes.object,
}

export default Index

export const qurey = graphql`
  query PN#####Page {
    directorys: allDirectory(
      filter: {
        sourceInstanceName: { eq: "PN#####" }
        relativeDirectory: { regex: "/^$|^\\.\\.$/" }
      }
      sort: { order: DESC, fields: relativeDirectory }
    ) {
      nodes {
        id
        name
      }
    }
    posts: allFile(
      filter: {
        sourceInstanceName: { eq: "PN#####" }
        absolutePath: { regex: "/.md$/" }
      }
      sort: { fields: childrenMarkdownRemark___frontmatter___date, order: DESC }
    ) {
      nodes {
        sourceInstanceName
        childMarkdownRemark {
          frontmatter {
            date(formatString: "MMMM DD , YYYY")
            title
          }
          fields {
            slug
          }
          excerpt(truncate: true)
          id
        }
      }
    }
  }
`
