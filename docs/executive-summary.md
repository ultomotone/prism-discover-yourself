# Executive Summary

- Unified, deterministic scoring engine (v1.2.1) with goldens.
- Tokenized results access: public token path + owner path via auth.
- Rotation RPC and TTL to manage link lifetime.
- RLS-first DB; public access via SECURITY DEFINER RPCs only.
- Legacy fallback removed/locked; smoke tests added.
