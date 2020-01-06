import { Card, Icon, Tooltip, Form, Switch, Upload, message } from 'antd'
import { withFormik, Field } from 'formik'
import PropTypes from 'prop-types'
import React, { useEffect, useState, useCallback } from 'react'
import * as yup from 'yup'
import CustomInput from '../../components/custom-input'
import itemTypes from '../../utils/item-types'
import ipfsPublish from '../../utils/ipfs-publish'
import { sanitize } from '../../utils/string'

const FormItem = Form.Item

const RelTCRParams = ({
  handleSubmit,
  formId,
  errors,
  setFieldValue,
  touched,
  ...rest
}) => {
  const { values, setTcrState } = rest
  const [advancedOptions, setAdvancedOptions] = useState()
  useEffect(() => {
    setTcrState(previousState => ({
      ...previousState,
      ...values
    }))
  }, [values, setTcrState])

  const fileUploadStatusChange = useCallback(({ file: { status } }) => {
    if (status === 'done')
      message.success(`Primary document uploaded successfully.`)
    else if (status === 'error')
      message.error(`Primary document upload failed.`)
  }, [])

  const customRequest = useCallback(
    async ({ file, onSuccess, onError }) => {
      try {
        const data = await new Response(new Blob([file])).arrayBuffer()
        const ipfsFileObj = await ipfsPublish(sanitize(file.name), data)
        const fileURI = `/ipfs/${ipfsFileObj[1].hash}${ipfsFileObj[0].path}`

        setFieldValue('relTcrPrimaryDocument', fileURI)
        onSuccess('ok', `${process.env.REACT_APP_IPFS_GATEWAY}${fileURI}`)
      } catch (err) {
        console.error(err)
        onError(err)
      }
    },
    [setFieldValue]
  )

  return (
    <Card title="Choose the parameters of the Related TCR">
      <Form layout="vertical" id={formId} onSubmit={handleSubmit}>
        <CustomInput
          name="relSubmissionBaseDeposit"
          placeholder="0.1 ETH"
          addonAfter="ETH"
          error={errors.relSubmissionBaseDeposit}
          touched={touched.relSubmissionBaseDeposit}
          type={itemTypes.NUMBER}
          label={
            <span>
              Submission Deposit&nbsp;
              <Tooltip title="This will be the deposit required to submit an item.">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          }
          {...rest}
        />
        <CustomInput
          name="relRemovalBaseDeposit"
          placeholder="0.1 ETH"
          addonAfter="ETH"
          error={errors.relRemovalBaseDeposit}
          touched={touched.relRemovalBaseDeposit}
          type={itemTypes.NUMBER}
          label={
            <span>
              Removal Deposit&nbsp;
              <Tooltip title="This will be the deposit required to remove an item.">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          }
          {...rest}
        />
        <CustomInput
          name="relSubmissionChallengeBaseDeposit"
          placeholder="0.05 ETH"
          addonAfter="ETH"
          error={errors.relSubmissionChallengeBaseDeposit}
          touched={touched.relSubmissionChallengeBaseDeposit}
          type={itemTypes.NUMBER}
          label={
            <span>
              Submission Challenge Deposit&nbsp;
              <Tooltip title="This is the deposit required to challenge a submission.">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          }
          {...rest}
        />
        <CustomInput
          name="relRemovalChallengeBaseDeposit"
          placeholder="0.05 ETH"
          addonAfter="ETH"
          error={errors.relRemovalChallengeBaseDeposit}
          touched={touched.relRemovalChallengeBaseDeposit}
          type={itemTypes.NUMBER}
          label={
            <span>
              Removal Challenge Deposit&nbsp;
              <Tooltip title="This is the deposit required to challenge a removal request.">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          }
          {...rest}
        />
        <CustomInput
          name="relChallengePeriodDuration"
          placeholder="5"
          addonAfter="Hours"
          error={errors.relChallengePeriodDuration}
          touched={touched.relChallengePeriodDuration}
          type={itemTypes.NUMBER}
          step={1}
          label={
            <span>
              Challenge Period Duration&nbsp;
              <Tooltip title="The length of the challenge period in hours.">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          }
          {...rest}
        />
        <div style={{ marginBottom: '26px' }}>
          <div className="ant-col ant-form-item-label">
            <label htmlFor="rel-primary-document">
              <span>Primary Document&nbsp;</span>
            </label>
          </div>
          <Upload.Dragger
            name="rel-primary-document"
            onChange={fileUploadStatusChange}
            customRequest={customRequest}
            multiple={false}
          >
            <p className="ant-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="ant-upload-hint">
              Click or drag a the primary document to this area.
            </p>
          </Upload.Dragger>
        </div>
        <Form.Item
          label="Advanced options"
          style={{ marginBottom: '12px', display: 'flex' }}
        >
          <Switch
            onChange={() => setAdvancedOptions(toggle => !toggle)}
            style={{ marginLeft: '8px' }}
          />
        </Form.Item>
        {advancedOptions && (
          <>
            <CustomInput
              name="relArbitratorAddress"
              placeholder="0x7331deadbeef..."
              hasFeedback
              error={errors.relArbitratorAddress}
              touched={touched.relArbitratorAddress}
              label={
                <span>
                  Arbitrator&nbsp;
                  <Tooltip title="The address of the arbitrator to use for this TCR.">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              }
              {...rest}
            />
            <CustomInput
              name="relGovernorAddress"
              placeholder="0x7331deadbeef..."
              hasFeedback
              error={errors.relGovernorAddress}
              touched={touched.relGovernorAddress}
              label={
                <span>
                  Governor&nbsp;
                  <Tooltip title="The address of the governor to use for this TCR.">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              }
              {...rest}
            />
            <Field name="relRequireRemovalEvidence">
              {({ field }) => (
                <FormItem
                  label="Require evidence for removing items"
                  style={{ marginBottom: '12px', display: 'flex' }}
                >
                  <Switch
                    onChange={value =>
                      setFieldValue('relRequireRemovalEvidence', value)
                    }
                    style={{ marginLeft: '8px' }}
                    checked={field.value}
                  />
                </FormItem>
              )}
            </Field>
          </>
        )}
      </Form>
    </Card>
  )
}

RelTCRParams.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  formId: PropTypes.string.isRequired,
  errors: PropTypes.objectOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string))
    ])
  ).isRequired,
  touched: PropTypes.objectOf(
    PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.arrayOf(PropTypes.objectOf(PropTypes.bool))
    ])
  ).isRequired
}

const validationSchema = yup.object().shape({
  relArbitratorAddress: yup
    .string()
    .required('An arbitrator address is required.')
    .max(160, 'Ethereum addresses are 42 characters long.'),
  relGovernorAddress: yup
    .string()
    .required('A governor address is required.')
    .max(160, 'Ethereum addresses are 42 characters long.'),
  relSubmissionBaseDeposit: yup
    .number()
    .typeError('Amount should be a number.')
    .required('A value is required.')
    .min(0, 'The amount must not be negative.'),
  relRemovalBaseDeposit: yup
    .number()
    .typeError('Amount should be a number.')
    .required('A value is required.')
    .min(0, 'The amount must not be negative.'),
  relSubmissionChallengeBaseDeposit: yup
    .number()
    .typeError('Amount should be a number.')
    .required('A value is required.')
    .min(0, 'The amount must not be negative.'),
  relRemovalChallengeBaseDeposit: yup
    .number()
    .typeError('Amount should be a number.')
    .required('A value is required.')
    .min(0, 'The amount must not be negative.'),
  relChallengePeriodDuration: yup
    .number()
    .typeError('Amount should be a number.')
    .required('A value is required.')
    .min(0, 'The amount must not be negative.'),
  relTcrPrimaryDocument: yup
    .string()
    .required('A primary document is required.')
})

export default withFormik({
  validationSchema,
  mapPropsToValues: ({ tcrState }) => {
    const values = { ...tcrState }
    delete values.transactions
    return values
  },
  handleSubmit: (_, { props: { postSubmit } }) => {
    postSubmit()
  }
})(RelTCRParams)