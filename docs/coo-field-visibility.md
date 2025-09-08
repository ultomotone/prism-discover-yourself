# COO Profile Field Visibility

Restrict the following Salesforce fields so only users with the **COO** profile can view them:

- Days in Stage
- Next Step
- Next Step Due At
- Next-Step Compliant
- Close Date Push Count
- Offer Sent
- Offer Sent Date
- Underwriting Start
- Underwriting Complete
- UW Handle Minutes
- Partner Source
- First_Response_At__c

## Steps
1. In Salesforce Setup, go to **Object Manager** and open the object containing the field.
2. Select **Fields & Relationships** and choose the field.
3. Click **Set Field-Level Security**.
4. Check **Visible** only for the **COO** profile; uncheck it for all other profiles.
5. Save the changes.
6. Ensure the field is removed from page layouts for non-COO profiles.

After saving, only users with the **COO** profile will see the listed fields.
