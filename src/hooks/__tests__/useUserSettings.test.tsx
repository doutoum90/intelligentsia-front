import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react';
import { useUserSettings } from '../useUserSettings';
import * as api from '../../services/api';
import theme from '../../theme/theme';

jest.mock('../../services/api', () => ({
    apiFetch: jest.fn(),
}));

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </QueryClientProvider>
);

describe('useUserSettings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        queryClient.clear();
    });

    it('fetches and updates settings successfully', async () => {
        const mockSettings = {
            avatar: 'avatar.jpg',
            name: 'Jean Dupont',
            email: 'jean@example.com',
            password: '',
            lastname: 'Dupont',
            dateOfBirth: '1990-01-01',
            profession: 'Développeur',
            oldPassword: '',
            confirmPassword: '',
        };

        (api.apiFetch as jest.Mock)
            .mockResolvedValueOnce(mockSettings)
            .mockResolvedValueOnce(mockSettings);

        const { result } = renderHook(() => useUserSettings(), { wrapper });

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.settings).toEqual(mockSettings);

        result.current.setSettings({ 
            ...mockSettings, 
            name: 'Jean Nouveau', 
            lastname: 'Dupont', 
            dateOfBirth: '1990-01-01', 
            profession: 'Développeur', 
            oldPassword: '', 
            confirmPassword: '', 
            password: '', 
        });
        result.current.saveSettings({});

        await waitFor(() => expect(api.apiFetch).toHaveBeenCalledWith('/api/user/update', expect.any(Object)));
    });

    it('uploads avatar successfully', async () => {
        (api.apiFetch as jest.Mock)
            .mockResolvedValueOnce({ avatar: '', name: '', email: '', password: '', lastname: '', dateOfBirth: '', profession: '', oldPassword: '', confirmPassword: '' })
            .mockResolvedValueOnce({ avatarUrl: 'new-avatar.jpg' });

        const { result } = renderHook(() => useUserSettings(), { wrapper });

        await waitFor(() => expect(result.current.loading).toBe(false));

        result.current.uploadAvatar(new File([''], 'avatar.jpg', { type: 'image/jpeg' }));

        await waitFor(() => expect(result.current.settings.avatar).toBe('new-avatar.jpg'));
    });
});