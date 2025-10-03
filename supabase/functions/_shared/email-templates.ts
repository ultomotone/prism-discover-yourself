// Email templates for post-survey system

export interface EmailTemplate {
  subject: string;
  html: string;
}

export const completionEmail = (
  resultsUrl: string,
  feedbackUrl: string,
  typeCode: string
): EmailTemplate => ({
  subject: "Your PRISM Results Are Ready! 🎯",
  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { color: #2563eb; margin-bottom: 20px; }
          .type-badge { display: inline-block; background: #2563eb; color: white; padding: 8px 16px; border-radius: 6px; font-weight: bold; margin: 10px 0; }
          .button { display: inline-block; background: #2563eb; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; font-weight: 500; }
          .button:hover { background: #1d4ed8; }
          hr { border: none; border-top: 1px solid #e5e7eb; margin: 30px 0; }
          .feedback-section { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <h1>Your PRISM Assessment Results Are Ready!</h1>
        
        <p>Congratulations on completing your PRISM personality assessment!</p>
        
        <p>Your primary type is: <span class="type-badge">${typeCode}</span></p>
        
        <p>Your comprehensive results reveal insights about your cognitive functions, decision-making style, and personality preferences.</p>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resultsUrl}" class="button">View Your Full Results</a>
        </p>
        
        <hr/>
        
        <div class="feedback-section">
          <h2 style="margin-top: 0; color: #2563eb;">Help Us Improve PRISM</h2>
          <p>We'd love your feedback! Please take just 2 minutes to share your experience with the assessment:</p>
          
          <p style="text-align: center;">
            <a href="${feedbackUrl}" class="button">Share Your Feedback</a>
          </p>
          
          <p style="font-size: 14px; color: #6b7280;">Your insights help us improve PRISM for everyone and contribute to personality science research.</p>
        </div>
        
        <div class="footer">
          <p><strong>Questions about your results?</strong><br>
          Visit your results page anytime to explore your type in detail.</p>
          
          <p style="font-size: 12px; margin-top: 20px;">
            This email was sent because you completed the PRISM assessment. If you have questions, please reply to this email.
          </p>
        </div>
      </body>
    </html>
  `,
});

export const feedbackReminder1 = (feedbackUrl: string): EmailTemplate => ({
  subject: "Quick Question About Your PRISM Results",
  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { color: #2563eb; margin-bottom: 20px; }
          .button { display: inline-block; background: #2563eb; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; font-weight: 500; }
          .button:hover { background: #1d4ed8; }
          .highlight { background: #fef3c7; padding: 2px 6px; border-radius: 3px; }
          .footer { font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <h1>How Are Your PRISM Results Working for You?</h1>
        
        <p>A few days ago, you completed the PRISM personality assessment. We hope you've had a chance to explore your results!</p>
        
        <p>We're conducting research to improve PRISM, and <span class="highlight">your feedback is incredibly valuable</span> to help us make the assessment even better.</p>
        
        <p>This quick 2-minute survey helps us understand:</p>
        <ul>
          <li>How clear and understandable the assessment was</li>
          <li>How well your results resonated with you</li>
          <li>What we can improve for future test-takers</li>
        </ul>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="${feedbackUrl}" class="button">Complete Survey (2 min)</a>
        </p>
        
        <div class="footer">
          <p style="font-size: 12px;">
            If you've already completed the survey, thank you! You can disregard this reminder.<br>
            If you prefer not to receive these reminders, your survey link will expire in a few days.
          </p>
        </div>
      </body>
    </html>
  `,
});

export const feedbackReminder2 = (feedbackUrl: string): EmailTemplate => ({
  subject: "Last Chance: Help Us Improve PRISM 🙏",
  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { color: #2563eb; margin-bottom: 20px; }
          .button { display: inline-block; background: #2563eb; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; font-weight: 500; }
          .button:hover { background: #1d4ed8; }
          .callout { background: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; }
          .footer { font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <h1>Final Request for Feedback</h1>
        
        <p>This is our last reminder about the PRISM feedback survey.</p>
        
        <div class="callout">
          <p style="margin: 0;"><strong>Your voice matters!</strong> Even if your experience wasn't perfect, your honest feedback helps us improve PRISM for thousands of future users.</p>
        </div>
        
        <p>The survey takes just 2 minutes and includes:</p>
        <ul>
          <li>Rating the clarity and engagement of the assessment</li>
          <li>Sharing how accurate your results felt</li>
          <li>Providing suggestions for improvement (optional)</li>
        </ul>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="${feedbackUrl}" class="button">Share Your Feedback</a>
        </p>
        
        <p style="text-align: center; font-size: 14px; color: #6b7280;">This survey link will expire soon and this is the final reminder you'll receive.</p>
        
        <div class="footer">
          <p>Thank you for considering! Your participation in PRISM assessment research is greatly appreciated.</p>
          <p style="font-size: 12px; margin-top: 15px;">
            If you've already completed the survey, thank you! No further action is needed.
          </p>
        </div>
      </body>
    </html>
  `,
});
