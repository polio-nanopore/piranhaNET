import os
from unittest.mock import patch, Mock, MagicMock, AsyncMock
from app.file_manager import FileManager

@patch("builtins.open")
@patch("app.file_manager.ZipFile")
@patch("app.file_manager.makedirs")
async def test_save_input(mock_makedirs, mock_zipfile_class, mock_open):
    run_id = "1234"
    mock_barcodes_file_upload = Mock()
    mock_barcodes_file_upload.filename = "test_barcodes.csv"

    barcodes_file_content = "1,2\nvalue 1, value2\n"
    mock_barcodes_file_upload.read = AsyncMock(return_value=barcodes_file_content)
    mock_minknow_zip_upload = Mock()
    mock_minknow_zip_upload.file = Mock()
    mock_minknow_zip_upload.close = AsyncMock()

    mock_minknow_zip_file = MagicMock()
    mock_zipfile_class.return_value = mock_minknow_zip_file

    mock_barcodes_file_saved = MagicMock()
    mock_open.return_value = mock_barcodes_file_saved

    sut = FileManager("/test_input", "/test_output")
    await sut.save_input(run_id, mock_barcodes_file_upload, mock_minknow_zip_upload)

    expected_minknow_dir = os.path.join("/test_input", run_id, "minknow")
    mock_makedirs.assert_called_once_with(expected_minknow_dir)
    mock_zipfile_class.assert_called_once_with(mock_minknow_zip_upload.file)
    # check __enter__.return_value here as these mocks are used as context managers (using "with")
    mock_minknow_zip_file.__enter__.return_value.extractall.assert_called_once_with(expected_minknow_dir)

    expected_barcodes_file_path = os.path.join("/test_input", run_id, "test_barcodes.csv")
    mock_open.assert_called_once_with(expected_barcodes_file_path, "wb")
    mock_barcodes_file_saved.__enter__.return_value.write.assert_called_once_with(barcodes_file_content)

# Test bad zipfile

# Test save output

# Test read output

# Test run_id not found

# Test run not completed