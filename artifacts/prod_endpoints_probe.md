# Production Endpoints Probe

**Function**: finalizeAssessment  
**Project**: gnkuikentdtnatazeriu  
**Probe Time**: 2025-09-17T17:12:30Z

## Canonical Endpoints

### Endpoint 1: Service Domain
**URL**: https://gnkuikentdtnatazeriu.functions.supabase.co/finalizeAssessment

#### OPTIONS Request
**Purpose**: Check CORS preflight support  
**Expected**: 200/204 with CORS headers

#### HEAD Request
**Purpose**: Check endpoint existence without body  
**Expected**: 405 (Method Not Allowed) for POST-only functions OR 200/204

**Analysis**: This is the newer, preferred endpoint format for Supabase Edge Functions.

### Endpoint 2: Legacy Functions Path
**URL**: https://gnkuikentdtnatazeriu.supabase.co/functions/v1/finalizeAssessment

#### OPTIONS Request
**Purpose**: Check CORS preflight support  
**Expected**: 200/204 with CORS headers

#### HEAD Request  
**Purpose**: Check endpoint existence without body  
**Expected**: 405 (Method Not Allowed) for POST-only functions OR 200/204

**Analysis**: This is the legacy path format, still supported but functions domain is preferred.

## Interpretation Guide

| Status | Endpoint 1 | Endpoint 2 | Diagnosis |
|--------|------------|------------|-----------|
| 404 | 404 | 404 | Function not deployed / wrong name |
| 401/403 | 401/403 | 401/403 | Function deployed, auth required |
| 405 | 405 | 405 | Function deployed, POST-only (good) |
| 200/204 | 200/204 | 200/204 | Function deployed, accepts HEAD |

## Current Status

**Probe Status**: ⏳ **PENDING EXECUTION**  
**Next Action**: Execute OPTIONS and HEAD requests to both endpoints  
**Expected Result**: 405 Method Not Allowed (indicates deployed POST-only function)