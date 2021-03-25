import React, { useState, useEffect, useCallback } from 'react'
import { goBack } from 'connected-react-router'
import { useDispatch, useSelector } from 'react-redux'
import { useRouteMatch } from 'react-router'
import PageWrapper from 'components/layouts/PageWrapper'
import ProjectDetail from 'components/projects/ProjectDetail'
import { Helmet } from 'react-helmet'

import moment from 'moment-timezone'
import { EventHelpers } from '@hackjunction/shared'

import { Box, TextField } from '@material-ui/core'
import Button from 'components/generic/Button'
import * as AuthSelectors from 'redux/auth/selectors'
import * as SnackbarActions from 'redux/snackbar/actions'

import ProjectsService from 'services/projects'
import ProjectScoresService from 'services/projectScores'

import { Formik, Form, Field, ErrorMessage } from 'formik'

import ScoreForm from './ScoreForm'

export default ({ event, showFullTeam }) => {
    const dispatch = useDispatch()

    const match = useRouteMatch()
    const { projectId, token } = match.params
    const { slug } = event

    const [project, setProject] = useState()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    console.log('project :>> ', project)
    const [validToken, setValidToken] = useState(false)

    useEffect(() => {
        if (token && project && event) {
            ProjectsService.validateToken(slug, token).then(v => {
                if (v) setValidToken(v)
            })
        }
    }, [event, project])

    const [projectScore, setProjectScore] = useState({
        project: '',
        event: '',
        status: 'submitted',
        score: 0,
        maxScore: 10,
        message: '',
    })
    useEffect(() => {
        if (token && project && event) {
            ProjectScoresService.getScoreByEventSlugAndProjectIdAndPartnerToken(
                token,
                event.slug,
                project._id,
            ).then(score => {
                if (score[0]) setProjectScore(score[0])
            })
        }
    }, [event, token, project])

    const fetchProject = useCallback(async () => {
        setLoading(true)
        try {
            const project = await ProjectsService.getPublicProjectById(
                projectId,
            )
            setProject(project)
        } catch (err) {
            setError(true)
        } finally {
            setLoading(false)
        }
    }, [projectId])

    const onBack = useCallback(() => {
        dispatch(goBack())
    }, [dispatch])

    useEffect(() => {
        fetchProject()
    }, [fetchProject])
    return (
        <PageWrapper loading={loading} error={error}>
            <ProjectDetail
                project={project}
                event={event}
                onBack={onBack}
                showFullTeam={showFullTeam}
                showTableLocation={!EventHelpers.isEventOver(event, moment)}
            />
            {validToken ? (
                <ScoreForm event={event} project={project} token={token} />
            ) : null}
        </PageWrapper>
    )
}
