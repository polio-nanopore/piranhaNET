import os
from unittest.mock import call, patch, Mock, MagicMock, AsyncMock
from app.file_manager import FileManager

run_id = "1234"
def get_sut():
    return FileManager("/test_input", "/test_output")

@patch("builtins.open")
@patch("app.file_manager.ZipFile")
@patch("app.file_manager.makedirs")
async def test_save_input(mock_makedirs, mock_zipfile_class, mock_open):
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

    sut = get_sut()
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

@patch("builtins.open")
@patch("app.file_manager.makedirs")
def test_save_output(mock_makedirs, mock_open):
    mock_report_file = MagicMock()
    mock_open.return_value = mock_report_file

    sut = get_sut()
    sut.save_output(run_id)

    expected_output_dir = os.path.join("/test_output", run_id)
    mock_makedirs.assert_called_once_with(expected_output_dir)
    mock_open.assert_called_once_with(os.path.join(expected_output_dir, "report.html"), "w")
    mock_report_writelines = mock_report_file.__enter__.return_value.writelines
    mock_report_writelines.assert_called_once()
    args, kwargs = mock_report_writelines.call_args
    assert args[0][0] == "<!doctype html>"


@patch("builtins.open")
@patch("app.file_manager.path.exists")
def test_read_output_report(mock_path_exists, mock_open):
    mock_path_exists.return_value = True
    mock_report_file = MagicMock()
    mock_open.return_value = mock_report_file
    mock_report_file.__enter__.return_value.read.return_value = "mock file contents"

    sut = get_sut()
    result = sut.read_output_report(run_id)
    mock_path_exists.assert_has_calls([
        call(os.path.join("/test_input", run_id)),
        call(os.path.join("/test_output", run_id, "report.html"))
    ])
    assert result == "mock file contents"



# Test run_id not found

# Test run not completed