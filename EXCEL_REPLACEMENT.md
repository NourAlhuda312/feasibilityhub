# Excel Replacement — FeasibilityHub

The original spreadsheet is replaced by live course data, while preserving the columns the professor already understands.

## Export columns

| Excel concept | FeasibilityHub source |
|---|---|
| Group Number | Automatically assigned `groups.group_number` |
| Group Members | Current members of the group |
| Name of the Idea | Latest submitted revision title |
| Quick Description | Latest submitted revision description |
| Status | Draft / Submitted / In review / Changes requested / Approved |

## Why this is better than the shared sheet

- Students cannot overwrite another group’s row.
- A student can belong to only one group in a course.
- Groups are capped at three members.
- The leader can change without recreating the team.
- The professor sees exactly which ideas are waiting, actively under review, returned for changes, or approved.
- Starting a review locks student edits until changes are requested.
- Revision history is preserved.
- Academic semesters keep Fall 2026 data separate from future offerings.
- The professor can still download `.csv` or `.xlsx` whenever a spreadsheet is needed.

## Preview export

Before Supabase is connected, Professor Preview can export demo rows for:
- Tafaddal
- Masar
- CoCompass
- Farhatna

After database setup, the normal professor export reads the real course groups and latest idea revisions.
