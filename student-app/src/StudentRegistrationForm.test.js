import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudentRegistrationForm from './StudentRegistrationForm';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function setup() {
  const user = userEvent.setup();
  render(<StudentRegistrationForm />);
  return { user };
}

// ---------------------------------------------------------------------------
// Render tests
// ---------------------------------------------------------------------------
describe('StudentRegistrationForm — render', () => {
  test('renders the form heading', () => {
    setup();
    expect(screen.getByRole('heading', { name: /student registration/i })).toBeInTheDocument();
  });

  test('renders Name, Email, and Age inputs', () => {
    setup();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
  });

  test('renders the Register submit button', () => {
    setup();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('inputs are empty on initial render', () => {
    setup();
    expect(screen.getByLabelText(/full name/i)).toHaveValue('');
    expect(screen.getByLabelText(/email address/i)).toHaveValue('');
    expect(screen.getByLabelText(/age/i)).toHaveValue(null);
  });
});

// ---------------------------------------------------------------------------
// Validation tests
// ---------------------------------------------------------------------------
describe('StudentRegistrationForm — validation', () => {
  test('shows all required-field errors when form is submitted empty', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /register/i }));
    expect(await screen.findByText(/full name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email address is required/i)).toBeInTheDocument();
    expect(screen.getByText(/age is required/i)).toBeInTheDocument();
  });

  test('shows error for a name that is too short', async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText(/full name/i), 'A');
    await user.click(screen.getByRole('button', { name: /register/i }));
    expect(await screen.findByText(/at least 2 characters/i)).toBeInTheDocument();
  });

  test('shows error for an invalid email format', async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText(/email address/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /register/i }));
    expect(await screen.findByText(/valid email address/i)).toBeInTheDocument();
  });

  test('shows error for an age of 0', async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText(/age/i), '0');
    await user.click(screen.getByRole('button', { name: /register/i }));
    expect(await screen.findByText(/whole number between 1 and 120/i)).toBeInTheDocument();
  });

  test('shows error for an age above 120', async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText(/age/i), '200');
    await user.click(screen.getByRole('button', { name: /register/i }));
    expect(await screen.findByText(/whole number between 1 and 120/i)).toBeInTheDocument();
  });

  test('clears field error once user starts correcting the input', async () => {
    const { user } = setup();
    // trigger name error
    await user.click(screen.getByRole('button', { name: /register/i }));
    expect(await screen.findByText(/full name is required/i)).toBeInTheDocument();
    // start correcting
    await user.type(screen.getByLabelText(/full name/i), 'A');
    expect(screen.queryByText(/full name is required/i)).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Successful submission tests
// ---------------------------------------------------------------------------
describe('StudentRegistrationForm — successful submission', () => {
  async function fillAndSubmit(user) {
    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/email address/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/age/i), '22');
    await user.click(screen.getByRole('button', { name: /register/i }));
  }

  test('shows success heading after valid submission', async () => {
    const { user } = setup();
    await fillAndSubmit(user);
    expect(await screen.findByText(/registration successful/i)).toBeInTheDocument();
  });

  test('displays submitted student details in success view', async () => {
    const { user } = setup();
    await fillAndSubmit(user);
    await screen.findByText(/registration successful/i);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('22')).toBeInTheDocument();
  });

  test('"Register Another Student" button resets the form', async () => {
    const { user } = setup();
    await fillAndSubmit(user);
    await screen.findByText(/registration successful/i);
    await user.click(screen.getByRole('button', { name: /register another student/i }));
    expect(screen.getByRole('heading', { name: /student registration/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toHaveValue('');
  });

  test('no validation errors are shown after a successful submit', async () => {
    const { user } = setup();
    await fillAndSubmit(user);
    await screen.findByText(/registration successful/i);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Accessibility / Lighthouse-related tests
// ---------------------------------------------------------------------------
describe('StudentRegistrationForm — accessibility', () => {
  test('each input has an associated label (for/id pairing)', () => {
    setup();
    expect(screen.getByLabelText(/full name/i)).toHaveAttribute('id', 'name');
    expect(screen.getByLabelText(/email address/i)).toHaveAttribute('id', 'email');
    expect(screen.getByLabelText(/age/i)).toHaveAttribute('id', 'age');
  });

  test('error inputs are marked with aria-invalid="true"', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByLabelText(/email address/i)).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByLabelText(/age/i)).toHaveAttribute('aria-invalid', 'true');
    });
  });

  test('error messages are rendered in role="alert" elements', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /register/i }));
    const alerts = await screen.findAllByRole('alert');
    expect(alerts.length).toBeGreaterThanOrEqual(3);
  });

  test('form has an accessible name via aria-label', () => {
    setup();
    expect(
      screen.getByRole('form', { name: /student registration form/i })
    ).toBeInTheDocument();
  });
});
