# PUSL3122 Report Template - Room Vista

Replace all placeholder text with your group's final content.

## Introduction

Room Vista is a web-based furniture visualization application developed for the Appendix A scenario in PUSL3122. The system supports designers during customer consultations by allowing room setup in 2D and realistic previews in 3D.

This report describes the full development lifecycle of the project, including data gathering, HCI-led design, implementation decisions, and usability evaluation outcomes.

- GitHub repository: `<insert repo link>`
- Video demonstration (7-12 mins): `<insert OneDrive/YouTube link>`

## Background

### Scenario Summary

A furniture retailer requires a web application to help designers and customers visualize furniture placement in rooms with different dimensions and color schemes.

### Target Users

- Primary users: in-store designers
- Secondary users: customers involved in design consultations

### Context of Use

- Physical setting: furniture retail consultation area
- Typical task: configure room, place furniture, adjust color/shading, present final view
- Constraints: limited consultation time, need for clear visuals and fast iteration

## Gathering Data

### Objective

Document how additional requirements were gathered beyond the coursework brief.

### Methods Used

- Method 1: `<e.g., semi-structured interviews>`
- Method 2: `<e.g., observation / questionnaire>`
- Participant profile: `<who participated>`

### Data Collection Process

- Recruitment approach: `<how participants were invited>`
- Question/task design: `<what was asked>`
- Data recording approach: `<notes/audio/forms>`

### Analysis

- Analysis method: `<e.g., thematic analysis / affinity mapping>`
- Key findings:
  - `<finding 1>`
  - `<finding 2>`
  - `<finding 3>`

### Requirements Derived

- Functional requirement added: `<...>`
- Usability requirement added: `<...>`
- Accessibility requirement added: `<...>`

## Design

### Requirements Overview

Map requirements to design decisions.

| Requirement | Design decision | Rationale |
|---|---|---|
| `<req>` | `<decision>` | `<why>` |

### Personas

- Persona 1: `<name, goals, frustrations, skills>`
- Persona 2: `<name, goals, frustrations, skills>`

### User Stories

- As a `<role>`, I want `<goal>`, so that `<benefit>`.
- As a `<role>`, I want `<goal>`, so that `<benefit>`.

### Storyboard

Include storyboard frames showing a full design consultation flow.

### Low-Fidelity Prototype

Insert sketches/wireframes and explain early structure and interaction.

### Formative Feedback on Low-Fi

- What was tested:
- Who tested:
- Main issues found:
- Design changes applied:

### High-Fidelity Prototype

Include final prototype screens and explain improvements from low-fi iteration.

### HCI and Usability Principles Applied

Reference principles used, such as:
- Consistency and standards
- Visibility of system status
- Error prevention and recovery
- User control and freedom
- Recognition over recall

## Implementation

### Architecture Summary

Describe high-level architecture:
- Frontend: Next.js + React
- 2D editor: Konva
- 3D renderer: Three.js / React Three Fiber
- Backend: Next.js API routes
- Storage/Auth: MongoDB + Firebase Auth
- Media: Cloudinary

### Key Implemented Features

- Authentication and role access
- 2D room editing with drag/rotate/resize
- Collision checks and boundary constraints
- Undo/redo and save safeguards
- 3D conversion with model rendering
- Furniture library CRUD (admin)
- Saved designs management

### Design-to-Code Traceability

| Design element | Implemented in code | Evidence |
|---|---|---|
| `<element>` | `<file/component>` | `<screenshot/link>` |

### Screenshots and Code Links

Add screenshots and links to relevant files in the repository.

### Justification of Technical Choices

Explain why your chosen stack and implementation decisions were appropriate for usability, performance, and maintainability.

## Evaluation

## Formative Study

### Aim

### Method

### Participants (>=2)

### Tasks

### Metrics / observation criteria

### Results

### Design changes made

## Summative Study

### Aim

### Method

### Participants (>=2)

### Tasks

### Metrics / observation criteria

### Results

### Interpretation

## Ethics and Consent

- Consent process used: `<describe>`
- Identity protection: no personal identifiers included
- No children involved

## Areas for Further Improvement

- `<improvement 1>`
- `<improvement 2>`
- `<improvement 3>`

## Summary

Summarize:
- What was built
- How HCI methods informed design
- What evaluation revealed
- What was improved as a result

## References

List all references in your required citation style.

- `<Reference 1>`
- `<Reference 2>`
- `<Reference 3>`

## Appendix (Optional)

- Consent form template
- Raw task sheets
- Extended screenshots/diagrams
- Additional testing notes
