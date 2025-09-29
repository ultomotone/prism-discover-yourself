import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface RetakeEligibleProps {
  completedDate: string
  assessmentUrl: string
  previousType?: string
}

export const RetakeEligibleEmail = ({
  completedDate,
  assessmentUrl,
  previousType,
}: RetakeEligibleProps) => (
  <Html>
    <Head />
    <Preview>You're now eligible to retake your PRISM assessment!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Ready for a Fresh Assessment?</Heading>
        
        <Text style={text}>
          It's been 30 days since you completed your PRISM personality assessment on {completedDate}.
          {previousType && ` Your previous result was ${previousType}.`}
        </Text>
        
        <Text style={text}>
          🎉 <strong>You're now eligible to retake the assessment!</strong>
        </Text>
        
        <Text style={text}>
          People can change and grow over time. Retaking the assessment can help you:
        </Text>
        
        <Text style={listText}>
          • See how your personality patterns have evolved<br/>
          • Gain new insights into your current cognitive preferences<br/>
          • Track your personal development journey<br/>
          • Get updated results that reflect who you are today
        </Text>
        
        <Link
          href={assessmentUrl}
          target="_blank"
          style={{
            ...button,
            display: 'block',
            marginBottom: '16px',
          }}
        >
          Retake Your PRISM Assessment
        </Link>
        
        <Text style={text}>
          The assessment takes about 20-30 minutes and will provide you with 
          fresh insights into your personality type and cognitive functions.
        </Text>
        
        <Text style={{...text, fontSize: '12px', color: '#666'}}>
          This is a one-time notification. You won't receive another retake 
          reminder unless you complete another assessment.
        </Text>
        
        <Text style={footer}>
          <Link
            href="https://prismpersonality.com"
            target="_blank"
            style={{ ...link, color: '#898989' }}
          >
            PRISM Personality
          </Link>
          <br />
          Discover your unique cognitive pattern
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RetakeEligibleEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  paddingLeft: '12px',
  paddingRight: '12px',
  margin: '0 auto',
  maxWidth: '600px',
}

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0 20px 0',
  padding: '0',
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const listText = {
  ...{
    color: '#374151',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '16px 0',
  },
  paddingLeft: '20px',
}

const button = {
  backgroundColor: '#10b981',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 24px',
  margin: '24px 0',
}

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
}

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '32px',
  marginBottom: '24px',
  textAlign: 'center' as const,
}