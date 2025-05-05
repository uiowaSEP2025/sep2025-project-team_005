import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateNewPost from '@/app/[username]/create-post/page';
import EditPhotos from '@/app/[username]/create-post/edit/page';
import axios from 'axios';
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

jest.mock('axios');

jest.mock('@pqina/react-pintura', () => ({
    PinturaEditor: ({ onProcess, onLoad, src }: any) => {
        React.useEffect(() => {
          onLoad?.();
          onProcess?.({
            dest: {
              blob: () => Promise.resolve(new Blob(["blob-content"], { type: 'image/jpeg' })),
            }
          });
        }, []);
        return (
          <div data-testid="pintura-editor">
            {src && <img src={src} alt="Edited" />}
            <button onClick={() => onProcess?.({
                dest: {
                    blob: () => Promise.resolve(new Blob(["blob-content"], { type: 'image/jpeg' })),
                }
                })}>
                    Mock Process
            </button>
          </div>
        );
    }      
}));
  
const mockPush = jest.fn();
const mockPost = jest.fn(() =>
    Promise.resolve({
      data: {},
      status: 201,
      statusText: "Created"
    })
  );
(axios.post as jest.Mock) = mockPost;

// Mock URL.createObjectURL and fetch mock
beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/edited-image');
  
    // Fetch mock: returns an object with a .blob() function
    global.fetch = jest.fn(() =>
      Promise.resolve({
        blob: () => Promise.resolve(new Blob(["image data"], { type: "image/jpeg" })),
      })
    ) as jest.Mock;
});

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

describe('EditPhotos page', () => {
    beforeEach(() => {
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
      (useParams as jest.Mock).mockReturnValue({ username: 'testuser' });
      (useRequireAuth as jest.Mock).mockImplementation(() => {});
      window.sessionStorage.clear();
  
      const testImages = JSON.stringify(["blob:http://localhost/image1"]);
      window.sessionStorage.setItem("uploadedImages", testImages);
    });
  
    it('renders Pintura editor and thumbnails when images are present in sessionStorage', () => {
      render(<EditPhotos />);
      expect(screen.getByText('Edit Photos:')).toBeInTheDocument();
      expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
      expect(screen.getByTestId('pintura-editor')).toBeInTheDocument();
    });
  
    it('updates the caption when typed into the caption input text area', async () => {
      render(<EditPhotos />);
      const captionInput = screen.getByPlaceholderText('Write a caption...');
      await userEvent.type(captionInput, 'This is a cool caption!');
      expect(captionInput).toHaveValue('This is a cool caption!');
    });
  
    it('handles image editing and submits a post', async () => {
        render(<EditPhotos />);
      
        // Wait for editor to render
        const processButton = await screen.findByText('Mock Process');
        
        // Simulate clicking the mock process button (which triggers the onProcess handler)
        fireEvent.click(processButton);
      
        // Fill in caption
        fireEvent.change(screen.getByPlaceholderText('Write a caption...'), {
          target: { value: 'Edited image' },
        });
      
        // Click the "Post" button
        fireEvent.click(screen.getByTestId('post-button'));
      
        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith('/testuser');
        });
    }); 
    
    it('shows an error alert if the post fails', async () => {
        // Mock axios.post to return a failed status
        (axios.post as jest.Mock).mockResolvedValueOnce({
            status: 400,
            statusText: "Bad Request",
            data: {}
        });

        // Mock alert
        window.alert = jest.fn();

        render(<EditPhotos />);

        // Simulate user editing image
        const processButton = await screen.findByText('Mock Process');
        fireEvent.click(processButton);

        // Add a caption
        fireEvent.change(screen.getByPlaceholderText('Write a caption...'), {
        target: { value: 'Bad post test' },
        });

        // Click post
        fireEvent.click(screen.getByTestId('post-button'));

        await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
            'Post creation failed. Please refresh the page and try again.'
        );
        });
    });
});