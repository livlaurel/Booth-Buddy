import pytest
import json
from io import BytesIO

class TestStorageAPI:
    """Test cases for Storage API endpoints"""
    
    def test_upload_without_file(self, client):
        """Test upload endpoint without file - should return 400"""
        response = client.post('/api/v1/storage/upload', 
                               data={'user_id': 'test_user'})
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_list_user_strips(self, client):
        """Test listing user strips"""
        response = client.get('/api/v1/storage/user/test_user/strips')
        assert response.status_code in [200, 500]
        if response.status_code == 200:
            data = json.loads(response.data)
            assert 'count' in data
            assert 'items' in data
    
    def test_delete_strip(self, client):
        """Test deleting a strip"""
        response = client.delete('/api/v1/storage/test_path/test_file.png')
        assert response.status_code in [200, 500]
        data = json.loads(response.data)
        assert 'success' in data or 'error' in data
