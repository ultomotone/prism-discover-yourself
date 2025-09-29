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

interface IncompleteReminderProps {
  sessionId: string
  daysRemaining: number
  continueUrl: string
}

export const IncompleteReminderEmail = ({
  sessionId,
  daysRemaining,
  continueUrl,
}: IncompleteReminderProps) => (
  <Html>
    <Head />
    <Preview>Complete your PRISM personality assessment - {daysRemaining} days remaining</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Complete Your PRISM Assessment</Heading>
        
        <Text style={text}>
          You started your PRISM personality assessment but haven't finished it yet. 
          Don't lose your progress!
        </Text>
        
        <Text style={{...text, fontWeight: 'bold', color: '#d97706'}}>
          ⚠️ Your session will be automatically deleted in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}.
        </Text>
        
        <Link
          href={continueUrl}
          target="_blank"
          style={{
            ...button,
            display: 'block',
            marginBottom: '16px',
          }}
        >
          Continue Your Assessment
        </Link>
        
        <Text style={text}>
          The PRISM assessment takes about 20-30 minutes to complete and provides 
          valuable insights into your personality type and cognitive functions.
        </Text>
        
        <Text style={{...text, fontSize: '12px', color: '#666'}}>
          If you no longer wish to receive these reminders, simply complete or 
          abandon your assessment by visiting the link above.
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

export default IncompleteReminderEmail

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

const button = {
  backgroundColor: '#3b82f6',
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