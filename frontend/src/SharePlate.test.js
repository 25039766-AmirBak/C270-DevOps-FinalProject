import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FoodRequest from './components/FoodRequest';
import DonationTable from './components/DonationTable';

// Mock the global fetch API so we can test backend calls without needing a live server
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: "Success" }),
  })
);

describe('SharePlate Comprehensive UI & Logic Tests', () => {

    beforeEach(() => {
        // Clear mocks before every test to ensure a clean slate
        fetch.mockClear();
        window.alert = jest.fn();
    });

    // ---------------------------------------------------------
    // GROUP 1: Core Environment & Sanity Checks
    // ---------------------------------------------------------
    it('1. should successfully execute the React testing framework (Jest)', () => {
        expect(true).toBe(true);
    });

    it('2. should confirm the environment is set to test', () => {
        expect(process.env.NODE_ENV).toBe('test');
    });


    // ---------------------------------------------------------
    // GROUP 2: FoodRequest Component Tests
    // ---------------------------------------------------------
    const mockDonation = { _id: '1', foodName: 'Fresh Apples', quantity: 10, location: 'Yishun' };

    it('3. should correctly render the FoodRequest component button', () => {
        render(<FoodRequest donation={mockDonation} />);
        expect(screen.getByRole('button', { name: /Request Food/i })).toBeInTheDocument();
    });

    it('4. should trigger the request logic alert when FoodRequest button is clicked', () => {
        render(<FoodRequest donation={mockDonation} />);
        fireEvent.click(screen.getByRole('button', { name: /Request Food/i }));
        expect(window.alert).toHaveBeenCalledWith('Request sent for Fresh Apples');
    });


    // ---------------------------------------------------------
    // GROUP 3: DonationTable Component Tests
    // ---------------------------------------------------------
    const mockFilteredDonations = [
        { _id: '101', foodName: 'Chicken Rice', quantity: 5, location: 'Ang Mo Kio', status: 'Available' },
        { _id: '102', foodName: 'Fried Noodles', quantity: 2, location: 'Bedok', status: 'Requested' }
    ];

    it('5. should render an empty state message when no donations are available', () => {
        render(<DonationTable filteredDonations={[]} setMessage={jest.fn()} />);
        expect(screen.getByText('No food donations available.')).toBeInTheDocument();
    });

    it('6. should render the exact number of donation cards based on the data array length', () => {
        render(<DonationTable filteredDonations={mockFilteredDonations} setMessage={jest.fn()} />);
        // Two items in the mock array, so there should be exactly two buttons rendered
        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(2);
    });

    it('7. should display the correct food name, quantity, and location data on the card', () => {
        render(<DonationTable filteredDonations={mockFilteredDonations} setMessage={jest.fn()} />);
        expect(screen.getByText('Chicken Rice')).toBeInTheDocument();
        
        const quantityLabels = screen.getAllByText(/Quantity:/i);
        const locationLabels = screen.getAllByText(/Location:/i);
        
        // Use .parentElement to read the entire <p> tag instead of just the <strong> tag
        expect(quantityLabels[0].parentElement).toHaveTextContent('5');
        expect(locationLabels[0].parentElement).toHaveTextContent('Ang Mo Kio');
    });

    it('8. should apply the correct CSS class dynamically based on Available status', () => {
        render(<DonationTable filteredDonations={mockFilteredDonations} setMessage={jest.fn()} />);
        const availableSpan = screen.getByText('Available');
        expect(availableSpan).toHaveClass('status-available');
    });

    it('9. should apply the correct CSS class dynamically based on Unavailable status', () => {
        render(<DonationTable filteredDonations={mockFilteredDonations} setMessage={jest.fn()} />);
        const unavailableSpan = screen.getByText('Requested');
        expect(unavailableSpan).toHaveClass('status-unavailable');
    });

    it('10. should disable the request button if the food status is NOT Available', () => {
        render(<DonationTable filteredDonations={mockFilteredDonations} setMessage={jest.fn()} />);
        const unavailableButton = screen.getByRole('button', { name: /Unavailable/i });
        expect(unavailableButton).toBeDisabled();
    });

    it('11. should enable the request button if the food status IS Available', () => {
        render(<DonationTable filteredDonations={mockFilteredDonations} setMessage={jest.fn()} />);
        const availableButton = screen.getByRole('button', { name: /Request Food/i });
        expect(availableButton).not.toBeDisabled();
    });

    // ---------------------------------------------------------
    // GROUP 4: Backend API Integration Tests
    // ---------------------------------------------------------
    it('12. should call the backend API (fetch) when a food request is submitted', async () => {
        const mockSetMessage = jest.fn();
        
        // Render the table with just the 'Available' item
        render(<DonationTable filteredDonations={[mockFilteredDonations[0]]} setMessage={mockSetMessage} />);
        
        // Simulate the user clicking "Request Food"
        const requestButton = screen.getByRole('button', { name: /Request Food/i });
        fireEvent.click(requestButton);
        
        // Verify that the component attempted to send the POST request to the backend
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/requests'),
                expect.objectContaining({
                    method: 'POST',
                    headers: { "Content-Type": "application/json" }
                })
            );
        });
    });
});