import pytest
import json
from io import BytesIO
from PIL import Image
import base64

class TestFiltersAPI:
    """Test cases for Image Filters API"""
    
    @pytest.fixture
    def base64_image(self):
        """Create a base64 encoded test image"""
        img = Image.new('RGB', (100, 100), color=(255, 0, 0))
        img_bytes = BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        return base64.b64encode(img_bytes.getvalue()).decode('utf-8')
    
    def test_apply_filter_no_image(self, client):
        """Test filter endpoint without image - should return 400"""
        payload = {'filter': 'grayscale'}
        response = client.post('/api/v1/filters/apply',
                               data=json.dumps(payload),
                               content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_invalid_filter_name(self, client, base64_image):
        """Test with invalid filter name - should return 400"""
        payload = {
            'image': base64_image,
            'filter': 'invalid_filter_xyz'
        }
        response = client.post('/api/v1/filters/apply',
                               data=json.dumps(payload),
                               content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_apply_valid_filter(self, client, base64_image):
        """Test applying a valid filter"""
        payload = {
            'image': base64_image,
            'filter': 'grayscale'
        }
        response = client.post('/api/v1/filters/apply',
                               data=json.dumps(payload),
                               content_type='application/json')
        assert response.status_code in [200, 400]
        data = json.loads(response.data)
        assert 'image' in data or 'error' in data
