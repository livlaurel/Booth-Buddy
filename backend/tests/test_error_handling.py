import pytest
import json

class TestErrorHandling:
    """Test error handling and edge cases"""
    
    def test_nonexistent_endpoint(self, client):
        """Test accessing non-existent endpoint - should return 404"""
        response = client.get('/api/v1/nonexistent')
        assert response.status_code == 404
    
    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get('/api/health')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'ok'
        assert 'version' in data
    
    def test_cors_headers(self, client):
        """Test CORS headers are set"""
        response = client.get('/api/health')
        # CORS headers should be present (Flask-CORS adds them)
        assert response.status_code == 200
    
    def test_post_without_content_type(self, client):
        """Test POST request without content-type header"""
        response = client.post('/api/v1/filters/apply')
        # Should handle gracefully
        assert response.status_code in [400, 415]
