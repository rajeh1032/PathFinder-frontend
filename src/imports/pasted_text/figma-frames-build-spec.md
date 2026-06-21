Act as a Principal UX Architect, Senior Product Designer, Design System Engineer, Software Architect, and Senior Prompt Engineer.

Your task is to generate one complete Markdown file only.

File name:

FIGMA_FRAMES_BUILD_SPEC.md

This file will be used as the final blueprint to manually build native editable Figma frames.

Do NOT generate React code.
Do NOT generate CSS.
Do NOT generate JSON.
Do NOT create Figma frames directly.
Do NOT explain.

Output only the final Markdown content.

==================================================
IMPORTANT CONTEXT
=================

Project Name:
PathFinder AI

Project Type:
Graduation Project

Product:
AI-powered Career Guidance Platform for students and fresh graduates.

Core Features:

* Career path discovery
* CV upload and AI CV analysis
* Skill gap detection
* Personalized roadmaps
* Course recommendations
* Job matching
* Interview simulation
* AI chatbot
* RAG knowledge base

This is a graduation project, not a large enterprise SaaS.

Keep the admin dashboard:

* Simple
* Clean
* Modern
* Focused
* Easy to present
* Easy to implement

==================================================
STRICT SOURCE OF TRUTH
======================

Use ONLY the final ERD below as the source of truth.

Ignore old SCREEN_DATA_MAPPING if it conflicts with this simplified graduation-project scope.

Do not add any field that does not exist in the ERD.

Do not add input fields for:

* AI-generated data
* User-generated data
* System-generated data
* API-generated data
* Computed / derived data

Only create forms for fields that the Admin can manually enter.

Every field must be classified as one of:

* Admin Input
* Read Only
* AI Generated
* User Generated
* System Generated
* Computed / Derived

==================================================
FINAL ERD
=========

ROLES:

* id
* name
* description
* is_system_role
* created_at
* updated_at

USERS:

* id
* name
* email
* password
* role_id
* is_active
* last_login_at
* last_active_at
* created_at
* updated_at

PROFILES:

* id
* user_id
* education_level
* university
* major
* current_status
* experience_level
* target_career_id
* location
* created_at
* updated_at

SKILLS:

* id
* name
* category
* level
* aliases
* is_active
* created_by
* updated_by
* created_at
* updated_at

USER_SKILLS:

* id
* user_id
* skill_id
* level
* created_at

CV_SKILLS:

* id
* cv_id
* skill_id
* source
* created_at

CAREER_PATHS:

* id
* title
* description
* category
* average_salary
* difficulty_level
* is_active
* created_by
* updated_by
* created_at
* updated_at

CAREER_PATH_SKILLS:

* id
* career_path_id
* skill_id
* required_level
* priority

COURSES:

* id
* title
* provider
* url
* thumbnail_url
* video_url
* level
* duration
* category
* is_active
* created_by
* updated_by
* created_at
* updated_at

CVS:

* id
* user_id
* file_url
* original_name
* parsed_text
* status
* uploaded_at

CV_ANALYSES:

* id
* cv_id
* score
* model
* summary
* strengths
* weaknesses
* suggestions
* detected_skills
* extracted
* generated_by_type
* reviewed_by_admin_id
* created_at
* reviewed_at

ROADMAPS:

* id
* user_id
* career_path_id
* title
* description
* progress
* status
* generated_by_type
* created_at
* updated_at

ROADMAP_STEPS:

* id
* roadmap_id
* skill_id
* title
* description
* step_order
* progress
* is_completed
* completed_at

JOBS:

* id
* title
* company
* location
* description
* source
* source_type
* apply_url
* required_skills
* employment_type
* salary_range
* is_active
* status
* created_by
* updated_by
* posted_at
* created_at
* updated_at

JOB_MATCHES:

* id
* user_id
* job_id
* cv_id
* match_percentage
* matched_skills
* missing_skills
* ai_reason
* generated_by_type
* status
* created_at

CHAT_SESSIONS:

* id
* user_id
* title
* status
* created_at
* updated_at

CHAT_MESSAGES:

* id
* session_id
* sender
* message
* tokens
* created_at

INTERVIEW_SESSIONS:

* id
* user_id
* career_path_id
* job_id
* status
* overall_score
* score_breakdown
* feedback_text
* recording_url
* created_at
* updated_at

INTERVIEW_QUESTIONS:

* id
* interview_session_id
* question
* user_answer
* feedback
* score
* generated_by_type

COVER_LETTERS:

* id
* user_id
* job_id
* content
* status
* version
* language
* generated_by_type
* created_at

AI_LOGS:

* id
* user_id
* feature
* model
* prompt
* response
* tokens_used
* latency_ms
* cost
* status
* error_message
* request_payload
* response_payload
* created_at

RAG_DOCUMENTS:

* id
* title
* type
* source
* content
* vector_id
* index_status
* index_error
* is_active
* uploaded_by
* created_at
* updated_at

RAG_CHUNKS:

* id
* rag_document_id
* content
* chunk_index
* token_count
* vector_id
* created_at

SYSTEM_SETTINGS:

* id
* setting_key
* setting_value
* type
* description
* updated_by
* updated_at

ACTIVITY_LOGS:

* id
* admin_user_id
* action
* module
* target_id
* target_type
* old_data
* new_data
* ip_address
* user_agent
* status
* created_at

==================================================
REMOVE THESE COMPLETELY
=======================

Do NOT include these screens or modules:

* Analytics page
* Roadmaps page
* API Sources page
* API Sync History page
* Chat Sessions page
* Cover Letters page
* Activity Logs page
* Roles Management
* Permissions Management
* RBAC UI
* Admins Management
* Team Management
* Invite Admin Flow
* Employer Portal
* Recruiter Portal
* Mentor Portal
* Notifications Center
* Separate Videos Module
* Billing
* Payments
* Subscriptions
* Revenue analytics
* Reports module

Important:
Roadmaps can appear inside User Details as read-only summary only.
Chat sessions can be counted in Dashboard only if needed, but do not create a Chat Sessions screen.
Cover letters can be ignored in the admin dashboard for graduation-project simplicity.
Activity logs can be used internally but do not create a separate Activity Logs screen.

==================================================
FINAL SIMPLIFIED SIDEBAR
========================

Use this sidebar only:

Dashboard

Users

Career Management

* Career Paths
* Skills
* Courses

Jobs

* Jobs
* Job Matches

AI Features

* CV Analyses
* Interview Sessions
* AI Logs

Knowledge Base

* RAG Documents

System

* Settings

No other sidebar tabs are allowed.

==================================================
FINAL SCREENS ONLY
==================

Generate the build spec for these screens only:

1. Admin Login
2. Dashboard
3. Users
4. User Details Drawer
5. Career Paths
6. Add / Edit Career Path Modal
7. Skills
8. Add / Edit Skill Modal
9. Courses
10. Add / Edit Course Modal
11. Jobs
12. Add / Edit Job Modal
13. Job Matches
14. Job Match Details Drawer
15. CV Analyses
16. CV Analysis Details Drawer
17. Interview Sessions
18. Interview Details Drawer
19. AI Logs
20. AI Log Details Drawer
21. RAG Documents
22. Upload RAG Document Modal
23. Settings

==================================================
FIGMA PAGES STRUCTURE
=====================

The Markdown file must instruct the designer to create these Figma pages:

01 - Design System
02 - Components
03 - Light Mode Screens
04 - Dark Mode Screens
05 - Prototype
06 - Developer Handoff

==================================================
DESIGN REQUIREMENTS
===================

Create a clean modern dashboard inspired by:

* Stripe
* Linear
* Notion
* OpenAI Platform
* Firebase Console

Use:

* Desktop-first layout
* 1440px main frames
* 1280px responsive reference
* 1024px responsive reference
* 8px grid
* Auto Layout everywhere
* Reusable components
* Component variants
* Light mode
* Dark mode
* WCAG accessibility
* Clear spacing
* Simple charts
* Professional but not overcomplicated graduation-project UI

==================================================
MARKDOWN FILE STRUCTURE REQUIRED
================================

The generated FIGMA_FRAMES_BUILD_SPEC.md must include these sections in this exact order:

1. Cover
2. Project Overview
3. Scope Rules
4. Final Sidebar
5. Figma Pages Structure
6. Design System
7. Layout Grid
8. Color Tokens
9. Typography
10. Spacing
11. Radius
12. Shadows
13. Icons
14. Components Library
15. Global Table Pattern
16. Global Modal Pattern
17. Global Drawer Pattern
18. Global Form Pattern
19. Global States
20. Prototype Rules
21. Screen-by-Screen Build Guide
22. Field Validation Matrix
23. Read-only vs Editable Matrix
24. Data Source Matrix
25. ERD Mapping Matrix
26. Invalid Fields Removed Matrix
27. Final QA Checklist
28. Developer Handoff Notes

==================================================
REQUIRED COMPONENTS
===================

For each component, describe:

* Purpose
* Size
* Auto Layout settings
* Padding
* Gap
* Border
* Radius
* Shadow
* Variants
* States
* Usage examples

Components required:

1. Button
   Variants:

* Primary
* Secondary
* Ghost
* Danger
  States:
* Default
* Hover
* Disabled
* Loading
  Sizes:
* Small
* Medium
* Large

2. Input
   Types:

* Text
* Number
* URL
* Email
* Password
* Search
* Textarea
* Select
* Multi Select
* Date Picker
* File Upload

States:

* Default
* Focus
* Error
* Disabled

3. Badge
   Variants:

* Success
* Warning
* Danger
* Info
* Neutral

4. Status Pill
5. Sidebar Item
6. Page Header
7. Stat Card
8. Data Table
9. Table Row
10. Table Toolbar
11. Pagination
12. Empty State
13. Loading Skeleton
14. Error State
15. Confirmation Modal
16. Form Modal
17. Right Drawer
18. Toast
19. Tabs
20. Chart Card
21. Progress Bar
22. Avatar
23. File Upload Dropzone
24. JSON Viewer
25. Key Value Row

==================================================
GLOBAL SCREEN STATES
====================

Every list screen must include:

* Default populated state
* Loading state
* Empty state
* Error state
* No results state

Every form modal must include:

* Empty form state
* Edit form state
* Validation error state
* Submitting state
* Success toast

Every delete action must include:

* Confirmation modal
* Success toast

Every drawer must include:

* Default data state
* Loading state
* Error state

==================================================
SCREEN-BY-SCREEN BUILD GUIDE REQUIREMENTS
=========================================

For every screen, include:

* Frame name
* Figma page
* Purpose
* Layout structure
* Header content
* Toolbar content
* Table columns
* Forms
* Modals
* Drawers
* Empty state
* Loading state
* Error state
* Prototype interactions
* Data source classification
* ERD mapping
* Editable/read-only rules
* Validation rules
* Notes for developer handoff

==================================================
SCREEN 1: ADMIN LOGIN
=====================

Frame name:
Login / Default

Purpose:
Allow the single admin to log in.

Fields:

1. email

* Type: Email
* Source: Admin Input
* ERD: USERS.email
* Required: Yes

2. password

* Type: Password
* Source: Admin Input
* ERD: USERS.password
* Required: Yes

Actions:

* Login
* Forgot password
* Remember me

States:

* Default
* Loading
* Invalid credentials error
* Empty field validation

Prototype:
Login button navigates to Dashboard.

Do not create registration screen.
Do not create invite admin screen.

==================================================
SCREEN 2: DASHBOARD
===================

Frame name:
Dashboard / Overview

Purpose:
Read-only overview of platform health.

No input fields.

KPI Cards:

* Total Users

  * Computed from USERS count
* Total CVs

  * Computed from CVS count
* Total CV Analyses

  * Computed from CV_ANALYSES count
* Total Career Paths

  * Computed from CAREER_PATHS count
* Total Skills

  * Computed from SKILLS count
* Total Courses

  * Computed from COURSES count
* Total Jobs

  * Computed from JOBS count
* Total Job Matches

  * Computed from JOB_MATCHES count
* Total Interviews

  * Computed from INTERVIEW_SESSIONS count
* Total RAG Documents

  * Computed from RAG_DOCUMENTS count
* AI Tokens Used

  * Computed from SUM(AI_LOGS.tokens_used)
* Estimated AI Cost

  * Computed from SUM(AI_LOGS.cost)

Charts:

* User Growth

  * Source: USERS.created_at
* CV Analysis Trend

  * Source: CV_ANALYSES.created_at
* Job Match Trend

  * Source: JOB_MATCHES.created_at
* AI Usage Trend

  * Source: AI_LOGS.created_at and AI_LOGS.tokens_used

Recent Activity:
Use ACTIVITY_LOGS as read-only internal data:

* action
* module
* target_type
* status
* created_at

All dashboard fields are read-only.

No create, edit, or delete actions here.

==================================================
SCREEN 3: USERS
===============

Frame name:
Users / List

Purpose:
View registered students.

Admin can:

* Search users
* Filter active/inactive
* View user details
* Activate / Deactivate user

Admin cannot:

* Create users
* Edit user profile data
* Edit user skills
* Edit uploaded CVs
* Edit AI results

Table columns:

1. Name

* ERD: USERS.name
* Source: User Generated
* Editable: No

2. Email

* ERD: USERS.email
* Source: User Generated
* Editable: No

3. Active

* ERD: USERS.is_active
* Source: Admin Input / System State
* Editable: Yes, toggle only

4. Target Career

* ERD: PROFILES.target_career_id → CAREER_PATHS.title
* Source: User Generated
* Editable: No

5. CV Count

* ERD: CVS count by user_id
* Source: Computed
* Editable: No

6. Roadmap Count

* ERD: ROADMAPS count by user_id
* Source: Computed
* Editable: No

7. Job Match Count

* ERD: JOB_MATCHES count by user_id
* Source: Computed
* Editable: No

8. Last Active

* ERD: USERS.last_active_at
* Source: System Generated
* Editable: No

9. Created Date

* ERD: USERS.created_at
* Source: System Generated
* Editable: No

Actions:

* View Details
* Activate / Deactivate

Do not include:

* Add User
* Edit Profile
* User phone
* User country
* User notes
* Avatar upload
* Status enum

==================================================
SCREEN 4: USER DETAILS DRAWER
=============================

Frame name:
Users / Details Drawer

Drawer width:
560px

Purpose:
Read-only 360 view of a user.

Sections:

1. Header

* USERS.name
* USERS.email
* USERS.is_active
* USERS.last_active_at
* USERS.created_at

2. Profile

* PROFILES.education_level
* PROFILES.university
* PROFILES.major
* PROFILES.current_status
* PROFILES.experience_level
* PROFILES.target_career_id → CAREER_PATHS.title
* PROFILES.location

3. Skills

* SKILLS.name via USER_SKILLS.skill_id
* USER_SKILLS.level

4. CVs

* CVS.original_name
* CVS.status
* CVS.uploaded_at

5. CV Analyses

* CV_ANALYSES.score
* CV_ANALYSES.model
* CV_ANALYSES.summary
* CV_ANALYSES.created_at

6. Roadmaps

* ROADMAPS.title
* ROADMAPS.progress
* ROADMAPS.status

7. Job Matches

* JOBS.title
* JOB_MATCHES.match_percentage
* JOB_MATCHES.status

8. Interviews

* INTERVIEW_SESSIONS.overall_score
* INTERVIEW_SESSIONS.status
* INTERVIEW_SESSIONS.created_at

All fields are read-only.

Only action:

* Close drawer

Optional action:

* Toggle user active/inactive

Do not create editable form fields here.

==================================================
SCREEN 5: CAREER PATHS
======================

Frame name:
Career Paths / List

Purpose:
Admin manages career path catalog.

Table columns:

1. Title

* CAREER_PATHS.title

2. Category

* CAREER_PATHS.category

3. Difficulty

* CAREER_PATHS.difficulty_level

4. Average Salary

* CAREER_PATHS.average_salary

5. Required Skills Count

* Computed from CAREER_PATH_SKILLS

6. Active

* CAREER_PATHS.is_active

7. Created Date

* CAREER_PATHS.created_at

Actions:

* Add Career Path
* Edit
* Delete
* Activate / Deactivate

Do not show:

* Courses Count
* Duration
* Thumbnail

unless added to ERD.

==================================================
SCREEN 6: ADD / EDIT CAREER PATH MODAL
======================================

Frame name:
Career Paths / Add Edit Modal

Modal width:
600px

Admin Input Fields:

1. title

* Type: Text
* Required: Yes
* ERD: CAREER_PATHS.title

2. description

* Type: Textarea
* Required: No
* ERD: CAREER_PATHS.description

3. category

* Type: Text
* Required: Yes
* ERD: CAREER_PATHS.category

4. average_salary

* Type: Text
* Required: No
* ERD: CAREER_PATHS.average_salary

5. difficulty_level

* Type: Select
* Required: No
* ERD: CAREER_PATHS.difficulty_level
* Options:

  * Beginner
  * Intermediate
  * Advanced
  * Expert

6. is_active

* Type: Switch
* Required: Yes
* ERD: CAREER_PATHS.is_active

7. Required Skills

* Type: Multi Select
* Source: SKILLS
* Writes to: CAREER_PATH_SKILLS.skill_id

For each selected skill:

* required_level

  * Type: Select
  * ERD: CAREER_PATH_SKILLS.required_level
* priority

  * Type: Number
  * ERD: CAREER_PATH_SKILLS.priority

System Generated:

* id
* created_by
* updated_by
* created_at
* updated_at

Do not include:

* courses selector
* thumbnail
* duration

==================================================
SCREEN 7: SKILLS
================

Frame name:
Skills / List

Purpose:
Admin manages skills taxonomy.

Table columns:

1. Name

* SKILLS.name

2. Category

* SKILLS.category

3. Level

* SKILLS.level

4. Aliases

* SKILLS.aliases

5. Active

* SKILLS.is_active

6. Used By Users Count

* Computed from USER_SKILLS

7. Used In Career Paths Count

* Computed from CAREER_PATH_SKILLS

8. CV Skills Count

* Computed from CV_SKILLS

9. Created Date

* SKILLS.created_at

Actions:

* Add Skill
* Edit Skill
* Delete Skill
* Activate / Deactivate

Do not show:

* Courses Count
* Description

unless added to ERD.

==================================================
SCREEN 8: ADD / EDIT SKILL MODAL
================================

Frame name:
Skills / Add Edit Modal

Modal width:
480px

Admin Input Fields:

1. name

* Type: Text
* Required: Yes
* ERD: SKILLS.name

2. category

* Type: Text
* Required: No
* ERD: SKILLS.category

3. level

* Type: Select
* Required: No
* ERD: SKILLS.level
* Options:

  * Beginner
  * Intermediate
  * Advanced
  * Expert

4. aliases

* Type: Tags Input
* Required: No
* ERD: SKILLS.aliases

5. is_active

* Type: Switch
* Required: Yes
* ERD: SKILLS.is_active

System Generated:

* id
* created_by
* updated_by
* created_at
* updated_at

Do not include:

* description

==================================================
SCREEN 9: COURSES
=================

Frame name:
Courses / List

Purpose:
Admin manages learning courses.

Table columns:

1. Thumbnail

* COURSES.thumbnail_url

2. Title

* COURSES.title

3. Provider

* COURSES.provider

4. Category

* COURSES.category

5. Level

* COURSES.level

6. Duration

* COURSES.duration

7. Active

* COURSES.is_active

8. Created Date

* COURSES.created_at

Actions:

* Add Course
* Edit
* Delete
* Activate / Deactivate

Do not show:

* Skills Covered
* Tags
* Description
* Published/Draft/Archived status

unless added to ERD.

Important:
No separate Videos module.
Course videos live in COURSES.video_url.

==================================================
SCREEN 10: ADD / EDIT COURSE MODAL
==================================

Frame name:
Courses / Add Edit Modal

Modal width:
700px

Admin Input Fields:

1. title

* Type: Text
* Required: Yes
* ERD: COURSES.title

2. provider

* Type: Text
* Required: Yes
* ERD: COURSES.provider

3. url

* Type: URL
* Required: Yes
* ERD: COURSES.url

4. thumbnail_url

* Type: URL
* Required: No
* ERD: COURSES.thumbnail_url

5. video_url

* Type: URL
* Required: No
* ERD: COURSES.video_url

6. level

* Type: Select
* Required: No
* ERD: COURSES.level
* Options:

  * Beginner
  * Intermediate
  * Advanced

7. duration

* Type: Text
* Required: No
* ERD: COURSES.duration

8. category

* Type: Text
* Required: No
* ERD: COURSES.category

9. is_active

* Type: Switch
* Required: Yes
* ERD: COURSES.is_active

System Generated:

* id
* created_by
* updated_by
* created_at
* updated_at

Do not include:

* skills covered
* tags
* description

==================================================
SCREEN 11: JOBS
===============

Frame name:
Jobs / List

Purpose:
Admin manages job listings.

For this graduation project, allow admin to manually create and edit jobs.

Table columns:

1. Title

* JOBS.title

2. Company

* JOBS.company

3. Location

* JOBS.location

4. Employment Type

* JOBS.employment_type

5. Salary Range

* JOBS.salary_range

6. Source

* JOBS.source

7. Status

* JOBS.status

8. Active

* JOBS.is_active

9. Posted Date

* JOBS.posted_at

Actions:

* Add Job
* Edit
* Delete
* Activate / Deactivate
* View Matches

Do not include:

* expiry date
* requirements as separate field
* salary min/max split
* API key configuration

==================================================
SCREEN 12: ADD / EDIT JOB MODAL
===============================

Frame name:
Jobs / Add Edit Modal

Modal width:
800px

Admin Input Fields:

1. title

* Type: Text
* Required: Yes
* ERD: JOBS.title

2. company

* Type: Text
* Required: Yes
* ERD: JOBS.company

3. location

* Type: Text
* Required: No
* ERD: JOBS.location

4. description

* Type: Textarea
* Required: No
* ERD: JOBS.description

5. source

* Type: Text
* Required: No
* ERD: JOBS.source

6. source_type

* Type: Select
* Required: No
* ERD: JOBS.source_type
* Options:

  * Manual
  * Adzuna
  * JSearch
  * Remotive

7. apply_url

* Type: URL
* Required: No
* ERD: JOBS.apply_url

8. required_skills

* Type: Tags Input or JSON Chips
* Required: No
* ERD: JOBS.required_skills

9. employment_type

* Type: Select
* Required: No
* ERD: JOBS.employment_type
* Options:

  * Full-time
  * Part-time
  * Internship
  * Contract
  * Remote

10. salary_range

* Type: Text
* Required: No
* ERD: JOBS.salary_range

11. status

* Type: Select
* Required: Yes
* ERD: JOBS.status
* Options:

  * Active
  * Closed
  * Draft

12. is_active

* Type: Switch
* Required: Yes
* ERD: JOBS.is_active

13. posted_at

* Type: Date
* Required: No
* ERD: JOBS.posted_at

System Generated:

* id
* created_by
* updated_by
* created_at
* updated_at

==================================================
SCREEN 13: JOB MATCHES
======================

Frame name:
Job Matches / List

Purpose:
View AI-generated job matches.

Read-only screen.

No add button.
No edit button.

Table columns:

1. User

* USERS.name via JOB_MATCHES.user_id

2. Job

* JOBS.title via JOB_MATCHES.job_id

3. CV

* CVS.original_name via JOB_MATCHES.cv_id

4. Match Percentage

* JOB_MATCHES.match_percentage
* Source: AI Generated
* Editable: No

5. Matched Skills Count

* Computed from JOB_MATCHES.matched_skills

6. Missing Skills Count

* Computed from JOB_MATCHES.missing_skills

7. Status

* JOB_MATCHES.status

8. Created Date

* JOB_MATCHES.created_at

Action:

* View Details
* Delete if needed

==================================================
SCREEN 14: JOB MATCH DETAILS DRAWER
===================================

Frame name:
Job Matches / Details Drawer

Drawer width:
560px

Read-only fields:

* User name
* Job title
* CV original_name
* match_percentage
* matched_skills
* missing_skills
* ai_reason
* generated_by_type
* status
* created_at

All are read-only.

Admin must not edit AI-generated match data.

==================================================
SCREEN 15: CV ANALYSES
======================

Frame name:
CV Analyses / List

Purpose:
View AI-generated CV analysis results.

Read-only screen.

No add button.
No edit button.

Table columns:

1. User

* USERS.name via CVS.user_id

2. CV

* CVS.original_name

3. Score

* CV_ANALYSES.score

4. Model

* CV_ANALYSES.model

5. Summary

* CV_ANALYSES.summary truncated

6. Created Date

* CV_ANALYSES.created_at

7. Reviewed At

* CV_ANALYSES.reviewed_at

Actions:

* View Details
* Re-run Analysis
* Delete if needed

Do not create input fields for CV analysis data.

==================================================
SCREEN 16: CV ANALYSIS DETAILS DRAWER
=====================================

Frame name:
CV Analyses / Details Drawer

Drawer width:
640px

Read-only fields:

* User name
* CV original_name
* score
* model
* summary
* strengths
* weaknesses
* suggestions
* detected_skills
* extracted
* generated_by_type
* reviewed_at
* created_at

All are AI-generated or system-generated.

Actions:

* Close
* Re-run Analysis
* Delete

==================================================
SCREEN 17: INTERVIEW SESSIONS
=============================

Frame name:
Interview Sessions / List

Purpose:
View AI interview sessions.

Read-only screen.

No add button.
No edit button.

Table columns:

1. User

* USERS.name via INTERVIEW_SESSIONS.user_id

2. Career Path

* CAREER_PATHS.title via INTERVIEW_SESSIONS.career_path_id

3. Job

* JOBS.title via INTERVIEW_SESSIONS.job_id

4. Status

* INTERVIEW_SESSIONS.status

5. Overall Score

* INTERVIEW_SESSIONS.overall_score

6. Created Date

* INTERVIEW_SESSIONS.created_at

Actions:

* View Details
* Delete if needed

==================================================
SCREEN 18: INTERVIEW DETAILS DRAWER
===================================

Frame name:
Interview Sessions / Details Drawer

Drawer width:
640px

Read-only fields:

* User
* Career Path
* Job
* status
* overall_score
* score_breakdown
* feedback_text
* recording_url
* created_at
* updated_at

Questions section:
Use INTERVIEW_QUESTIONS:

* question
* user_answer
* feedback
* score
* generated_by_type

All fields are read-only.

Actions:

* Close
* Delete
* Re-score if needed

==================================================
SCREEN 19: AI LOGS
==================

Frame name:
AI Logs / List

Purpose:
Read-only AI observability screen.

No add button.
No edit button.
No delete button.

Table columns:

1. Feature

* AI_LOGS.feature

2. Model

* AI_LOGS.model

3. User

* USERS.name via AI_LOGS.user_id

4. Tokens Used

* AI_LOGS.tokens_used

5. Latency

* AI_LOGS.latency_ms

6. Cost

* AI_LOGS.cost

7. Status

* AI_LOGS.status

8. Created Date

* AI_LOGS.created_at

Actions:

* View Details
* Export

==================================================
SCREEN 20: AI LOG DETAILS DRAWER
================================

Frame name:
AI Logs / Details Drawer

Drawer width:
640px

Read-only fields:

* feature
* model
* prompt
* response
* tokens_used
* latency_ms
* cost
* status
* error_message
* request_payload
* response_payload
* created_at

Use JSON Viewer component for request_payload and response_payload.

All fields are read-only.

==================================================
SCREEN 21: RAG DOCUMENTS
========================

Frame name:
RAG Documents / List

Purpose:
Admin manages knowledge base documents.

Table columns:

1. Title

* RAG_DOCUMENTS.title

2. Type

* RAG_DOCUMENTS.type

3. Index Status

* RAG_DOCUMENTS.index_status

4. Active

* RAG_DOCUMENTS.is_active

5. Chunks Count

* Computed from RAG_CHUNKS

6. Uploaded By

* USERS.name via RAG_DOCUMENTS.uploaded_by

7. Created Date

* RAG_DOCUMENTS.created_at

Actions:

* Upload Document
* Reindex
* Delete
* Activate / Deactivate

Do not show:

* description
* tags
* file size

unless added to ERD.

==================================================
SCREEN 22: UPLOAD RAG DOCUMENT MODAL
====================================

Frame name:
RAG Documents / Upload Modal

Modal width:
520px

Admin Input Fields:

1. file

* Type: File Upload
* Required: Yes
* Stored as: RAG_DOCUMENTS.source / content after processing

2. title

* Type: Text
* Required: Yes
* ERD: RAG_DOCUMENTS.title

3. type

* Type: Select
* Required: Yes
* ERD: RAG_DOCUMENTS.type
* Options:

  * Career Guide
  * Course Material
  * CV Rules
  * Job Market Data
  * FAQ
  * Other

4. is_active

* Type: Switch
* Required: Yes
* ERD: RAG_DOCUMENTS.is_active

System Generated:

* id
* source
* content
* vector_id
* index_status
* index_error
* uploaded_by
* created_at
* updated_at
* RAG_CHUNKS

Do not include:

* description
* tags
* file_size

==================================================
SCREEN 23: SETTINGS
===================

Frame name:
Settings / Main

Purpose:
Simple admin settings for graduation project.

Use tabs:

* General
* AI Configuration
* Maintenance
* Admin Profile

General fields:

1. app_name

* Stored in SYSTEM_SETTINGS.setting_key = app_name
* Admin Input

2. support_email

* Stored in SYSTEM_SETTINGS.setting_key = support_email
* Admin Input

3. default_language

* Stored in SYSTEM_SETTINGS.setting_key = default_language
* Admin Input

AI Configuration fields:

1. ai_provider

* SYSTEM_SETTINGS.setting_key = ai_provider
* Admin Input

2. ai_model

* SYSTEM_SETTINGS.setting_key = ai_model
* Admin Input

3. max_tokens

* SYSTEM_SETTINGS.setting_key = max_tokens
* Admin Input

4. temperature

* SYSTEM_SETTINGS.setting_key = temperature
* Admin Input

Maintenance fields:

1. maintenance_enabled

* SYSTEM_SETTINGS.setting_key = maintenance_enabled
* Admin Input

2. maintenance_message

* SYSTEM_SETTINGS.setting_key = maintenance_message
* Admin Input

Admin Profile:

1. admin_name

* USERS.name
* Admin Input

2. admin_email

* USERS.email
* Admin Input

3. change_password

* USERS.password
* Admin Input through secure change password flow

Do not include:

* Appearance tab
* Theme setting
* Primary color picker
* Logo URL
* Billing
* SMTP
* Storage settings
* API keys
* Enterprise security settings

==================================================
VALIDATION MATRICES REQUIRED
============================

At the end of the markdown, include these tables:

1. Editable Fields Matrix
   Columns:

* Screen
* Field
* ERD Table
* ERD Column
* Source Type
* Editable?
* Notes

2. Read-only Fields Matrix
   Columns:

* Screen
* Field
* Source Type
* Reason Read-only
* ERD Mapping

3. Invalid Fields Removed Matrix

Include fields/screens that must NOT be designed:

* Analytics page
* Roadmaps page
* API Sources page
* API Sync History page
* Chat Sessions page
* Cover Letters page
* Activity Logs page
* Roles Management
* Permissions Management
* Admin Management
* Videos module
* Course description
* Skill description
* Course skills covered
* Career path courses
* RAG description
* RAG tags
* RAG file size
* Job expiry date
* Job salary min/max
* User phone
* User country
* User notes
* User avatar upload
* API keys screen
* API Sources sidebar

For each invalid field/screen:

* Why removed
* What ERD issue exists
* What to add if we want it later

4. AI Generated Fields Matrix

Include:

* CV_ANALYSES score, summary, strengths, weaknesses, suggestions, detected_skills, extracted
* JOB_MATCHES match_percentage, matched_skills, missing_skills, ai_reason
* INTERVIEW_SESSIONS overall_score, score_breakdown, feedback_text
* INTERVIEW_QUESTIONS question, feedback, score
* COVER_LETTERS content
* ROADMAPS title, description
* ROADMAP_STEPS title, description

All these must be read-only.

5. Computed Fields Matrix

Include:

* KPI counts
* users count
* CV count
* roadmap count
* job match count
* skills count
* chunks count
* AI tokens sum
* AI cost sum
* matched skills count
* missing skills count

All computed fields must be read-only.

==================================================
FINAL QA CHECKLIST
==================

The markdown must end with a checklist:

* No Analytics page
* No Roadmaps page
* No API Sources page
* No API Sync History page
* No Chat Sessions page
* No Cover Letters page
* No Activity Logs page
* No RBAC screen
* No roles management screen
* No permissions screen
* No admins management screen
* No videos module
* No enterprise analytics
* No unsupported fields
* No inputs for AI-generated data
* No inputs for system-generated data
* No inputs for user-generated data
* No inputs for computed data
* Every admin input maps to an ERD column
* Every list screen has default/loading/empty/error/no-results states
* Every modal has validation/submitting/success states
* Every delete action has confirmation modal
* Light mode and dark mode are specified
* Prototype connections are specified
* Developer handoff notes are included

==================================================
OUTPUT REQUIREMENTS
===================

Output only the final Markdown content for:

FIGMA_FRAMES_BUILD_SPEC.md

Do not include any extra explanation before or after the Markdown.
