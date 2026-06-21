Act as a Senior Product Designer, UX Architect, and Software-Aware Figma Agent.

I need you to review and update the Admin Dashboard UI for PathFinder AI based on the final ERD and the actual data entry rules.

This is a graduation project, not a large enterprise SaaS product, so keep the dashboard simple, clean, and focused.

Before modifying the design, audit every screen, modal, drawer, form, and table against the ERD.

==================================================
MAIN RULES
==========

The dashboard is for ONE ADMIN only.

Do NOT create:

* Roles Management
* Permissions Management
* Admins Management
* Team Management
* Employer Portal
* Recruiter Portal
* Mentor Portal
* Separate Videos Module
* Complex Analytics page
* Separate API Sources page unless already implemented in the project logic
* Any field that does not exist in the ERD

Course videos must stay inside the Courses module using video_url.

Do not create any input field for data that is AI Generated, User Generated, API Generated, System Generated, or Computed.

Only create forms for data that the Admin is allowed to enter manually.

==================================================
FINAL SIMPLIFIED SIDEBAR
========================

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

==================================================
SCREEN-BY-SCREEN DATA ENTRY RULES
=================================

1. Dashboard

Purpose:
Read-only overview.

Do not create input fields.

Display:

* Total Users
* Total CVs
* Total CV Analyses
* Total Career Paths
* Total Skills
* Total Courses
* Total Jobs
* Total Job Matches
* Total Interviews
* Total RAG Documents
* AI Tokens Used
* Estimated AI Cost

Charts:

* User Growth
* CV Analysis Trend
* Job Match Trend
* AI Usage Trend

All dashboard data is computed or derived.

Admin should not enter any data here.

==================================================

2. Users

Purpose:
View and manage registered students.

Admin can:

* View users
* View user details
* Activate / Deactivate user
* Soft delete user if needed

Admin should NOT create users manually.

Users are created from the mobile app.

Table columns:

* Name
* Email
* Active Status
* Target Career
* CV Count
* Roadmap Count
* Job Match Count
* Last Active
* Created Date

User Details should be read-only except Active/Inactive status.

Do NOT allow Admin to edit:

* education_level
* university
* major
* current_status
* experience_level
* target_career_id
* location
* user skills
* uploaded CVs
* AI results

These are user-generated or AI-generated.

==================================================

3. Career Paths

Purpose:
Admin manages career path catalog.

Create/Edit form fields:

* title
* description
* category
* average_salary
* difficulty_level
* required skills
* required skill level
* skill priority
* is_active

System generated:

* id
* created_at
* updated_at
* created_by
* updated_by

Do NOT add:

* duration_months
* thumbnail_url

unless these fields are added to the ERD.

==================================================

4. Skills

Purpose:
Admin manages the skills taxonomy.

Create/Edit form fields:

* name
* category
* level
* aliases
* is_active

System generated:

* id
* created_at
* updated_at
* created_by
* updated_by

Read-only computed values:

* Users Count
* Career Paths Count
* CV Skills Count

Do NOT show Courses Count unless a COURSE_SKILLS relationship exists in the ERD.

Do NOT add description unless SKILLS.description exists in the ERD.

==================================================

5. Courses

Purpose:
Admin manages learning courses.

Create/Edit form fields:

* title
* provider
* url
* thumbnail_url
* video_url
* level
* duration
* category
* is_active

System generated:

* id
* created_at
* updated_at
* created_by
* updated_by

Important:
Course videos are managed through video_url inside Courses.
Do NOT create a separate Videos module.

Do NOT add Related Skills unless COURSE_SKILLS exists in the ERD.

Do NOT add description unless COURSES.description exists in the ERD.

==================================================

6. Jobs

Purpose:
Admin manages job listings.

For this graduation project, allow Admin to manually create and edit jobs.

Create/Edit form fields:

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
* status
* is_active
* posted_at

System generated:

* id
* created_at
* updated_at
* created_by
* updated_by

Do NOT require API Source configuration in the UI unless it is already implemented.

Do NOT show API key or API provider settings here.

==================================================

7. Job Matches

Purpose:
View AI-generated job matches.

This screen is read-only.

Admin can:

* View match details
* Delete match if needed

Admin must NOT edit:

* match_percentage
* matched_skills
* missing_skills
* ai_reason
* generated_by_type

These fields are AI Generated.

Details should show:

* User
* Job
* CV
* Match Percentage
* Matched Skills
* Missing Skills
* AI Reason
* Status
* Created Date

==================================================

8. CV Analyses

Purpose:
View AI-generated CV analysis results.

This screen is read-only.

Admin can:

* View analysis
* Re-run analysis
* Delete analysis if needed

Admin must NOT edit:

* score
* model
* summary
* strengths
* weaknesses
* suggestions
* detected_skills
* extracted data
* generated_by_type

These fields are AI Generated.

Details should show:

* CV owner
* CV file
* Score
* Summary
* Strengths
* Weaknesses
* Suggestions
* Detected Skills
* Extracted Data
* Model
* Created Date

==================================================

9. Interview Sessions

Purpose:
View AI interview sessions.

This screen is read-only.

Admin can:

* View interview details
* Delete session if needed

Admin must NOT edit:

* questions
* answers
* feedback
* score
* overall_score
* score_breakdown
* recording_url

Details should show:

* User
* Career Path
* Job if available
* Status
* Overall Score
* Questions
* User Answers
* AI Feedback
* Score Breakdown
* Recording URL if available
* Created Date

Role name should be derived from Career Path title or Job title.
Do NOT add a standalone role field unless it exists in the ERD.

==================================================

10. AI Logs

Purpose:
Read-only AI observability screen.

Admin can:

* Search
* Filter
* Export

Admin must NOT create, edit, or delete AI logs.

Show:

* feature
* model
* tokens_used
* latency_ms
* cost
* status
* error_message
* created_at

Details:

* prompt
* response
* request_payload
* response_payload

All AI Logs are system-generated.

==================================================

11. RAG Documents

Purpose:
Admin uploads and manages knowledge base documents.

Create/Upload form fields:

* file
* title
* type
* is_active

Optional only if these fields exist in ERD:

* tags
* description

System generated:

* source
* content
* vector_id
* index_status
* index_error
* uploaded_by
* created_at
* updated_at
* chunks

Admin can:

* Upload document
* View document
* Reindex document
* Delete document
* Activate / Deactivate document

Admin must NOT manually edit:

* content
* vector_id
* index_status
* index_error
* RAG chunks

==================================================

12. Settings

Purpose:
Simple admin settings for graduation project.

Keep settings simple.

Sections:

* General
* AI Configuration
* Maintenance
* Admin Profile

General fields:

* app_name
* support_email
* default_language

AI Configuration fields:

* ai_provider
* ai_model
* max_tokens
* temperature

Maintenance fields:

* maintenance_enabled
* maintenance_message

Admin Profile:

* name
* email
* change_password

Do NOT add complex SMTP, Storage, or Security settings unless they are implemented in the backend.

==================================================
GLOBAL UI REQUIREMENTS
======================

Every table must include:

* Search
* Filters
* Sorting
* Pagination
* Empty state
* Loading state
* Error state
* No results state
* Refresh button

Every create/edit form must include:

* Required field indicators
* Validation errors
* Submit loading state
* Success toast
* Cancel button

Every delete action must include:

* Confirmation modal

Every details view should use:

* Drawer or modal for graduation-project simplicity
* Avoid too many separate detail pages

Use:

* Clean modern UI
* Light mode
* Dark mode
* 8px grid
* Auto Layout
* Reusable components
* Simple charts
* Clear developer handoff

==================================================
FINAL VALIDATION
================

Before finalizing the Figma design, create a small table for each screen showing:

* Field name
* UI location
* Admin Input / Read-only
* Source type
* ERD table
* ERD column
* Is it editable?
* Notes

Flag any field that:

* Does not exist in the ERD
* Is AI Generated but designed as an input
* Is User Generated but designed as an input
* Is System Generated but designed as an input
* Is Computed but designed as an input

Do not finalize the design until all invalid inputs are removed or clearly marked as needing ERD changes.
