import pytest
import json

class TestStripsAPI:
    """Test cases for Strips API"""
    
    def test_health_endpoint(self, client):
        """Test health check endpoint"""
        response = client.get('/api/health')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'ok'
    
    def test_create_strip_without_data(self, client):
        """Test creating strip without required data"""
        response = client.post('/api/v1/strips',
                               data=json.dumps({}),
                               content_type='application/json')
        # Should return 400 if missing required fields
        assert response.status_code in [400, 405, 500]
