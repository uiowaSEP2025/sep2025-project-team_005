import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateNewPost from '@/app/[username]/create-post/page';
import { useRouter, useParams } from 'next/navigation';
import { useAuth, useRequireAuth } from '@/context/ProfileContext';
import userEvent from '@testing-library/user-event';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('@/context/ProfileContext', () => ({
  useAuth: jest.fn(),
  useRequireAuth: jest.fn(),
}));

const mockPush = jest.fn();

describe('CreateNewPost page', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useParams as jest.Mock).mockReturnValue({ username: 'testuser' });
    (useRequireAuth as jest.Mock).mockImplementation(() => {});
    (useAuth as jest.Mock).mockReturnValue({
      profile: { username: 'testuser' },
      isLoading: false,
      setProfile: jest.fn(),
    });

    // Clear sessionStorage before each test
    window.sessionStorage.clear();
  });

  it('renders file upload button and continue to edit button', () => {
    render(<CreateNewPost />);
    expect(screen.getByText('Upload Photos')).toBeInTheDocument();
    expect(screen.getByText(/upload files/i)).toBeInTheDocument();
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
  });

  it('shows a message if continue to edit is clicked without uploading at least one file', () => {
    // Mock the alert message
    window.alert = jest.fn();

    render(<CreateNewPost />);
    fireEvent.click(screen.getByTestId('edit-button'));
    expect(window.alert).toHaveBeenCalledWith('Please upload at least one photo before continuing.');
  });

  it('uploads file and shows filename after', async () => {
    render(<CreateNewPost />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/upload files/i);
    await userEvent.upload(input, file);

    expect(await screen.findByText('Files uploaded:')).toBeInTheDocument();
    expect(screen.getByText('hello.png')).toBeInTheDocument();
  });

  it('navigates to edit page after file upload and clicking continue to edit', async () => {
    render(<CreateNewPost />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/upload files/i);
    await userEvent.upload(input, file);

    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/testuser/create-post/edit');
    });
  });
});
