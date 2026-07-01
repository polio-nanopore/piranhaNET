from unittest.mock import AsyncMock, MagicMock, Mock, patch
from zipfile import BadZipFile

import fastapi
import pytest

from app.file_manager import FileManager

run_id = "1234"


def get_sut(tmp_path):
    return FileManager(tmp_path / "test_input", tmp_path / "test_output")


@patch("app.file_manager.ZipFile")
async def test_save_input(mock_zipfile_class, tmp_path):
    mock_barcodes_file_upload = Mock()
    mock_barcodes_file_upload.filename = "test_barcodes.csv"

    barcodes_file_content = "1,2\nvalue 1, value2\n"
    mock_barcodes_file_upload.read = AsyncMock(return_value=barcodes_file_content.encode())
    mock_minknow_zip_upload = Mock()
    mock_minknow_zip_upload.file = Mock()
    mock_minknow_zip_upload.close = AsyncMock()

    mock_minknow_zip_file = MagicMock()
    mock_zipfile_class.return_value = mock_minknow_zip_file

    sut = get_sut(tmp_path)
    await sut.save_input(run_id, mock_barcodes_file_upload, mock_minknow_zip_upload)

    expected_minknow_dir = tmp_path / "test_input" / run_id / "minknow"
    # Expect minnow dir to have been created
    assert expected_minknow_dir.exists()
    mock_zipfile_class.assert_called_once_with(mock_minknow_zip_upload.file)

    # check __enter__.return_value here as these mocks are used as context managers (using "with")
    mock_minknow_zip_file.__enter__.return_value.extractall.assert_called_once_with(expected_minknow_dir)
    mock_minknow_zip_upload.close.assert_called_once()

    # Expect barcodes file to have been written
    expected_barcodes_file = tmp_path / "test_input" / run_id / "test_barcodes.csv"
    assert expected_barcodes_file.read_text() == barcodes_file_content


@patch("app.file_manager.ZipFile")
async def test_save_input_raises_httpexception_on_bad_zipfile(mock_zipfile_class, tmp_path):
    mock_zipfile_class.side_effect = BadZipFile("bad zip")
    mock_barcodes_upload = Mock()
    mock_minknow_upload = Mock()
    mock_minknow_upload.close = AsyncMock()

    sut = get_sut(tmp_path)
    with pytest.raises(fastapi.HTTPException) as exc_info:
        await sut.save_input(run_id, mock_barcodes_upload, mock_minknow_upload)
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Invalid zip file."
    mock_minknow_upload.close.assert_called_once()


#def test_save_output(tmp_path):
#    sut = get_sut(tmp_path)
#    sut.save_output(run_id)
#
#    expected_output_report = tmp_path / "test_output" / run_id / "report.html"
#    assert expected_output_report.read_text().startswith("<!doctype html>")


def test_read_output_report(tmp_path):
    test_input_dir = tmp_path / "test_input" / run_id
    test_input_dir.mkdir(parents=True)
    test_report_content = "<not an html report>"
    test_report_dir = tmp_path / "test_output" / run_id
    test_report_dir.mkdir(parents=True)
    test_report = test_report_dir / "report.html"
    test_report.write_text(test_report_content)

    sut = get_sut(tmp_path)
    result = sut.read_output_report(run_id)
    assert result == test_report_content


def test_read_output_report_raises_httpexception_on_unknown_run_id(tmp_path):
    sut = get_sut(tmp_path)
    with pytest.raises(fastapi.HTTPException) as exc_info:
        sut.read_output_report(run_id)
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Run ID 1234 not found."


def test_read_output_report_raises_httpexception_when_run_incomplete(tmp_path):
    test_input_dir = tmp_path / "test_input" / run_id
    test_input_dir.mkdir(parents=True)
    sut = get_sut(tmp_path)
    with pytest.raises(fastapi.HTTPException) as exc_info:
        sut.read_output_report(run_id)
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Run 1234 has not completed."
