import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Form, Select, Upload, Card, message, Alert, FloatButton, Checkbox } from 'antd';
import { CameraOutlined, SaveOutlined, WarningOutlined, SettingOutlined } from '@ant-design/icons';
import PageLayout from '../components/layout/PageLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import SaveResultModal from '../components/ui/SaveResultModal';
import { useAuth } from '../hooks/useAuth';
import { useProject } from '../hooks/useProject';
import { dbUtils } from '../utils/database';
import { ROUTES } from '../config/constants';
import dayjs from 'dayjs';

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userName } = useAuth();
  const { project, loading, error } = useProject(id);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [allMaintenanceOptions, setAllMaintenanceOptions] = useState([]); // 儲存所有原始選項
  const [filteredThings, setFilteredThings] = useState([]); // 篩選後的檢查項目
  const [filteredLocations, setFilteredLocations] = useState([]); // 篩選後的檢查位置
  const [submittedLocations, setSubmittedLocations] = useState([]); // 儲存已提交的樓層、檢查項目、檢查位置組合
  const [availableFloors, setAvailableFloors] = useState([]); // 儲存最終可用的樓層選項
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [showSettingAlert, setShowSettingAlert] = useState(false);
  const [settingDisabled, setSettingDisabled] = useState(false);
  const [saveResultVisible, setSaveResultVisible] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [addWatermark, setAddWatermark] = useState(() => {
    const savedWatermarkSetting = localStorage.getItem('addWatermark');
    return savedWatermarkSetting ? JSON.parse(savedWatermarkSetting) : true;
  });

  useEffect(() => {
    if (project) {
      checkMaintenanceSetting();
      fetchMaintenanceOptions();
      fetchSubmittedLocations(); // Fetch submitted locations
      form.setFieldsValue({
        maintainance_time: dayjs().format('YYYY-MM-DD'),
        maintainance_user: userName
      });
    }
  }, [project, userName, form]);

  useEffect(() => {
    localStorage.setItem('addWatermark', JSON.stringify(addWatermark));
  }, [addWatermark]);

  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const checkMaintenanceSetting = async () => {
    try {
      const { data, error } = await dbUtils.maintenanceSettings.getByProject(project.name);

      if (error && error.code !== 'PGRST116') {
        console.error('檢查保養設定失敗:', error);
        return;
      }

      const today = dayjs();
      if (!data) {
        setShowSettingAlert(true);
        setSettingDisabled(true);
      } else if (data.time_start && data.time_finish) {
        const startDate = dayjs(data.time_start);
        const endDate = dayjs(data.time_finish);
        
        if (today.isBefore(startDate) || today.isAfter(endDate)) {
          setShowSettingAlert(true);
          setSettingDisabled(true);
        }
      }
    } catch (error) {
      console.error('檢查保養設定錯誤:', error);
    }
  };

  const fetchMaintenanceOptions = async () => {
    try {
      const { data, error } = await dbUtils.maintenanceData.getOptions(project.name);
      if (error) throw error;
      setAllMaintenanceOptions(data);
    } catch (error) {
      console.error('獲取保養選項失敗:', error);
    }
  };

  const fetchSubmittedLocations = async () => {
    try {
      const { data, error } = await dbUtils.maintenancePhoto.getByProject(project.name);
      if (error) throw error;
      // Store submitted locations as a set of composite keys (floor_thing_location)
      const submitted = new Set(data.map(item => `${item.floor}_${item.thing}_${item.location}`));
      setSubmittedLocations(Array.from(submitted));
    } catch (error) {
      console.error('獲取已提交位置失敗:', error);
    }
  };

  const filterOptions = useCallback(() => {
    console.log('--- filterOptions (Attempt 3) started ---');
    console.log('allMaintenanceOptions (initial):', allMaintenanceOptions);
    console.log('submittedLocations (initial):', submittedLocations);

    const currentSelectedFloor = form.getFieldValue('floor');
    const currentSelectedThing = form.getFieldValue('thing');

    console.log('Current form values - selectedFloor:', currentSelectedFloor, 'selectedThing:', currentSelectedThing);

    const submittedSet = new Set(submittedLocations);

    // Step 1: Determine truly available locations for the currently selected floor and thing
    let newFilteredLocations = [];
    if (currentSelectedFloor && currentSelectedThing) {
      newFilteredLocations = allMaintenanceOptions
        .filter(item => item.floor === currentSelectedFloor && item.thing === currentSelectedThing)
        .map(item => item.location)
        .filter(Boolean) // Remove null/undefined/empty strings
        .filter(location => {
          const compositeKey = `${currentSelectedFloor}_${currentSelectedThing}_${location}`;
          return !submittedSet.has(compositeKey);
        });
      setFilteredLocations([...new Set(newFilteredLocations)]);
    } else {
      setFilteredLocations([]);
    }
    console.log('Filtered Locations (Step 1):', [...new Set(newFilteredLocations)]);

    // Step 2: Determine truly available things for the currently selected floor
    // A thing is available if, for its floor, it has at least one unsubmitted location
    let newFilteredThings = [];
    if (currentSelectedFloor) {
      const thingsForSelectedFloor = allMaintenanceOptions
        .filter(item => item.floor === currentSelectedFloor)
        .map(item => item.thing)
        .filter(Boolean); // Remove null/undefined/empty strings

      newFilteredThings = [...new Set(thingsForSelectedFloor.filter(thing => {
        const hasAvailableLocation = allMaintenanceOptions
          .filter(item => item.floor === currentSelectedFloor && item.thing === thing)
          .some(item => {
            const compositeKey = `${currentSelectedFloor}_${thing}_${item.location}`;
            return !submittedSet.has(compositeKey);
          });
        return hasAvailableLocation;
      }))];
      setFilteredThings(newFilteredThings);
    } else {
      setFilteredThings([]);
    }
    console.log('Filtered Things (Step 2):', [...new Set(newFilteredThings)]);

    // Step 3: Determine truly available floors
    // A floor is available if it has at least one thing that has at least one unsubmitted location
    const trulyAvailableFloors = new Set();
    allMaintenanceOptions.forEach(option => {
      const floor = option.floor;
      if (!floor) return; // Skip if floor is null/undefined

      const thingsForThisFloor = allMaintenanceOptions
        .filter(item => item.floor === floor)
        .map(item => item.thing)
        .filter(Boolean); // Remove null/undefined/empty strings

      const hasAvailableThingInFloor = thingsForThisFloor.some(thing => {
        const hasAvailableLocationForThisThing = allMaintenanceOptions
          .filter(item => item.floor === floor && item.thing === thing)
          .some(item => {
            const compositeKey = `${floor}_${thing}_${item.location}`;
            return !submittedSet.has(compositeKey);
          });
        return hasAvailableLocationForThisThing;
      });

      if (hasAvailableThingInFloor) {
        trulyAvailableFloors.add(floor);
      }
    });
    setAvailableFloors(Array.from(trulyAvailableFloors));
    console.log('Available Floors (Step 3):', Array.from(trulyAvailableFloors));
    console.log('--- filterOptions (Attempt 3) finished ---');

  }, [allMaintenanceOptions, form, submittedLocations]);

  useEffect(() => {
    console.log('ProjectPage useEffect for filterOptions triggered. Project:', project, 'allMaintenanceOptions.length:', allMaintenanceOptions.length, 'submittedLocations.length:', submittedLocations.length);
    // Ensure filterOptions runs when dependencies change, and also on initial load if data is present
    // or if project is loaded and data is empty (to correctly set initial empty states)
    if (project && (allMaintenanceOptions.length > 0 || submittedLocations.length > 0 || (allMaintenanceOptions.length === 0 && submittedLocations.length === 0))) {
      filterOptions();
    }
  }, [allMaintenanceOptions, submittedLocations, filterOptions, project]);

  const handleValuesChange = (changedValues, allValues) => {
    console.log('handleValuesChange called. changedValues:', changedValues, 'allValues:', allValues);
    if ('floor' in changedValues) {
      form.setFieldsValue({ thing: undefined, location: undefined });
      console.log('Floor changed, resetting thing and location in form.');
    }
    if ('thing' in changedValues) {
      form.setFieldsValue({ location: undefined });
      console.log('Thing changed, resetting location in form.');
    }
    // Always re-filter options after any value change
    filterOptions();
  }