# Setup Guide

## Step 1: Install n8n

### Option A: Docker (Recommended)
```bash
docker run -it --rm \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n
```

### Option B: n8n Cloud
Go to [app.n8n.cloud](https://app.n8n.cloud/) and sign up (free tier available).

### Option C: npm
```bash
npm install n8n -g
n8n start
```

## Step 2: Get an AI API Key

### Claude (Recommended)
1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Create account → API Keys → Create Key
3. Copy the key

### OpenAI
1. Go to [platform.openai.com](https://platform.openai.com/)
2. API Keys → Create new secret key
3. Copy the key

### DeepSeek (Cheapest)
1. Go to [platform.deepseek.com](https://platform.deepseek.com/)
2. Create account → API Keys
3. Copy the key

## Step 3: Import a Template

1. Open n8n at `http://localhost:5678`
2. Click the **...** menu (top right) → **Import from File**
3. Select any `.json` file from `templates/free/`
4. The workflow appears in your canvas

## Step 4: Configure Credentials

### Gmail Setup
1. In n8n, go to **Settings** → **Credentials**
2. Click **Add Credential** → **Gmail OAuth2**
3. Follow the Google authentication flow
4. Back in the workflow, click the Gmail node → select your credential

### AI API Setup
1. In n8n, go to **Settings** → **Credentials**
2. Click **Add Credential** → **OpenAI API** (works for Claude too via compatible endpoint)
3. Paste your API key
4. Back in the workflow, click the AI node → select your credential

## Step 5: Customize

### Change the AI prompt
Click the "AI" node → edit the system message. Example:
```
You are a customer service agent for [YOUR BUSINESS NAME].
Our products: [LIST YOUR PRODUCTS]
Our return policy: [YOUR POLICY]
Be friendly and helpful. Always offer solutions.
```

### Change email addresses
Click email nodes → update "From" and "To" addresses.

### Change schedule
Click the Schedule node → adjust the trigger time.

## Step 6: Activate

Toggle the workflow switch to **Active** (top right of the workflow editor).

Done! The workflow will now run automatically.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Gmail auth fails | Make sure you're using a Google Workspace account, or add your email as a test user in Google Cloud Console |
| AI node errors | Check your API key is valid and has credits |
| Workflow doesn't trigger | Make sure the workflow is set to "Active" |
| Email not sending | Check spam folder; verify SMTP credentials |

## Need Help?

- [n8n Documentation](https://docs.n8n.io/)
- [n8n Community Forum](https://community.n8n.io/)
- Open an issue in this repo