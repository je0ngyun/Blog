import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'
import { Layout } from '../../components/Layout'
import { Seo } from '../../components/Seo'
import { Sidebar } from '../../components/Sidebar'
import { ProjectList } from '../../components/ProjectList'
import { PageDescription } from '../../components/PageDescription'
import { PageTitle } from '../../components/PageTitle'
import { capitalize } from '../../utils/capitalize'
import { useTopLevelPathName } from '../../hooks'

const Index = ({ data }) => {
  const topLevelPathName = useTopLevelPathName()
  const pageName = capitalize(topLevelPathName)
  const projects = data.posts.nodes
  const directorys = data.directorys.nodes
  const description =
    '학부 시절 및 취업 후 사이드 프로젝트로 진행했던 주요 프로젝트들이며 최근 개발순으로 정렬되어있습니다.'

  return (
    <Layout belongs={topLevelPathName}>
      <Seo title={pageName} />
      <Sidebar directorys={directorys} currentCategoryName={topLevelPathName} />
      <PageTitle title={pageName} />
      <PageDescription description={description} />
      <ProjectList projects={projects} />
    </Layout>
  )
}

Index.propTypes = {
  data: PropTypes.object,
}

export default Index

export const qurey = graphql`
  query ProjectPage {
    directorys: allDirectory(
      filter: {
        sourceInstanceName: { eq: "projects" }
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
        sourceInstanceName: { eq: "projects" }
        absolutePath: { regex: "/.md$/" }
      }
      sort: {
        fields: childrenMarkdownRemark___frontmatter___period
        order: DESC
      }
    ) {
      nodes {
        sourceInstanceName
        childMarkdownRemark {
          frontmatter {
            title
            tags
            tech
            desc
            period
          }
          fields {
            slug
          }
          id
        }
      }
    }
  }
`
