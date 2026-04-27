import React, { useState } from 'react';
import './StudentRegistrationForm.css';

const INITIAL_STATE = { name: '', email: '', age: '' };

function validate({ name, email, age }) {
  const errors = {};

  if (!name.trim()) {
    errors.name = 'Full name is required.';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  const ageNum = Number(age);
  if (!age) {
    errors.age = 'Age is required.';
  } else if (!Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120) {
    errors.age = 'Age must be a whole number between 1 and 120.';
  }

  return errors;
}

export default function StudentRegistrationForm() {
  const [fields, setFields] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    // Clear the error for the field being edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitted(true);
  }

  function handleReset() {
    setFields(INITIAL_STATE);
    setErrors({});
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <section className="srf-card" aria-live="polite">
        <h1 className="srf-title">Registration Successful 🎉</h1>
        <dl className="srf-summary">
          <dt>Name</dt>
          <dd>{fields.name}</dd>
          <dt>Email</dt>
          <dd>{fields.email}</dd>
          <dt>Age</dt>
          <dd>{fields.age}</dd>
        </dl>
        <button type="button" className="srf-btn" onClick={handleReset}>
          Register Another Student
        </button>
      </section>
    );
  }

  return (
    <main className="srf-wrapper">
      <section className="srf-card">
        <h1 className="srf-title">Student Registration</h1>

        <form onSubmit={handleSubmit} noValidate aria-label="Student registration form">
          {/* Name */}
          <div className="srf-field">
            <label htmlFor="name" className="srf-label">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={`srf-input${errors.name ? ' srf-input--error' : ''}`}
              placeholder="Enter your full name"
              value={fields.name}
              onChange={handleChange}
              autoComplete="name"
              aria-describedby={errors.name ? 'name-error' : undefined}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <span id="name-error" className="srf-error" role="alert">
                {errors.name}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="srf-field">
            <label htmlFor="email" className="srf-label">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`srf-input${errors.email ? ' srf-input--error' : ''}`}
              placeholder="Enter your email"
              value={fields.email}
              onChange={handleChange}
              autoComplete="email"
              aria-describedby={errors.email ? 'email-error' : undefined}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <span id="email-error" className="srf-error" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          {/* Age */}
          <div className="srf-field">
            <label htmlFor="age" className="srf-label">
              Age
            </label>
            <input
              id="age"
              name="age"
              type="number"
              min="1"
              max="120"
              className={`srf-input srf-input--short${errors.age ? ' srf-input--error' : ''}`}
              placeholder="e.g. 20"
              value={fields.age}
              onChange={handleChange}
              aria-describedby={errors.age ? 'age-error' : undefined}
              aria-invalid={!!errors.age}
            />
            {errors.age && (
              <span id="age-error" className="srf-error" role="alert">
                {errors.age}
              </span>
            )}
          </div>

          <button type="submit" className="srf-btn">
            Register
          </button>
        </form>
      </section>
    </main>
  );
}
